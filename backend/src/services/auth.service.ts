import { SessionTokenSchema } from "../lib/validation"
import { verifyToken, createClerkClient } from "@clerk/backend"
import { ENV } from "../lib/env"
import { prisma } from "../db/client"

export type Role = "customer" | "admin"
export type User = { id: string; clerkId: string; email: string; role: Role }

export async function validateSession(sessionToken: string): Promise<User> {
  if (!sessionToken || sessionToken.trim() === "") {
    throw new Error("Missing or empty session token")
  }
  
  SessionTokenSchema.parse(sessionToken)
  
  let verified
  try {
    verified = await verifyToken(sessionToken, { 
      secretKey: ENV.CLERK_SECRET_KEY() 
    })
  } catch (error: any) {
    throw new Error(`Token verification failed: ${error.message || "Invalid token"}`)
  }
  
  if (!verified) {
    throw new Error("Token verification returned null or undefined")
  }
  
  // @clerk/backend returns the JWT payload directly
  // The payload contains: sub (user ID), email, publicMetadata, etc.
  const payload = verified
  
  // Safely access sub property
  if (!payload || typeof payload !== 'object' || !('sub' in payload)) {
    throw new Error(`Token payload missing 'sub' (user ID) property. Payload keys: ${JSON.stringify(Object.keys(payload || {}))}`)
  }
  
  const clerkId = payload.sub as string
  if (!clerkId || typeof clerkId !== 'string') {
    throw new Error("Token payload 'sub' (user ID) is invalid or not a string")
  }
  
  const tokenEmail = (payload.email as string) || ""
  const clerkRole = (payload.publicMetadata?.role as Role) || "customer"

  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    // For new users, try to get email from Clerk API if not in token
    // This is especially important for OAuth providers like Gmail
    let email = tokenEmail
    
    if (!email || email.trim() === "" || email.includes("@temp.local")) {
      try {
        const clerk = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY() })
        const clerkUser = await clerk.users.getUser(clerkId)
        
        // Prioritize primary email or verified email
        if (clerkUser.primaryEmailAddressId) {
          const primaryEmail = clerkUser.emailAddresses.find(
            (e: any) => e.id === clerkUser.primaryEmailAddressId
          )
          if (primaryEmail) {
            email = primaryEmail.emailAddress
          }
        }
        
        // Fallback to first verified email
        if (!email || email.includes("@temp.local")) {
          const verifiedEmail = clerkUser.emailAddresses.find(
            (e: any) => e.verification?.status === "verified"
          )
          if (verifiedEmail) {
            email = verifiedEmail.emailAddress
          }
        }
        
        // Final fallback to first email
        if (!email || email.includes("@temp.local")) {
          email = clerkUser.emailAddresses[0]?.emailAddress || ""
        }
      } catch (error) {
        console.warn(`Failed to fetch user from Clerk API for ${clerkId}:`, error)
        // Will be updated by webhook when email is available
        email = ""
      }
    }
    
    // Create user with email if available
    // If email is still missing, use temp email as last resort (webhook will replace it)
    if (!email || email.trim() === "") {
      email = `user_${clerkId.slice(0, 8)}@temp.local`
      console.warn(`Creating user with temp email for ${clerkId} - webhook should update it`)
    }
    
    user = await prisma.user.create({ 
      data: { 
        clerkId, 
        email, 
        role: clerkRole 
      } 
    })
    
    console.log(`User created via validateSession: ${email} with role: ${clerkRole}`)
  } else {
    // Prioritize database role over Clerk metadata for admin access
    // If user is admin in DB, keep it; otherwise sync from Clerk
    const finalRole = user.role === "admin" ? "admin" : clerkRole
    
    // Get email from token, or try Clerk API if token doesn't have it
    let finalEmail = tokenEmail && tokenEmail.trim() !== "" ? tokenEmail : null
    
    // If token doesn't have email and user has temp email, try to fetch from Clerk API
    if (!finalEmail && user.email.includes("@temp.local")) {
      try {
        const clerk = createClerkClient({ secretKey: ENV.CLERK_SECRET_KEY() })
        const clerkUser = await clerk.users.getUser(clerkId)
        
        // Prioritize primary email or verified email
        if (clerkUser.primaryEmailAddressId) {
          const primaryEmail = clerkUser.emailAddresses.find(
            (e: any) => e.id === clerkUser.primaryEmailAddressId
          )
          if (primaryEmail) {
            finalEmail = primaryEmail.emailAddress
          }
        }
        
        // Fallback to first verified email
        if (!finalEmail) {
          const verifiedEmail = clerkUser.emailAddresses.find(
            (e: any) => e.verification?.status === "verified"
          )
          if (verifiedEmail) {
            finalEmail = verifiedEmail.emailAddress
          }
        }
        
        // Final fallback to first email
        if (!finalEmail) {
          finalEmail = clerkUser.emailAddresses[0]?.emailAddress || null
        }
      } catch (error) {
        console.warn(`Failed to fetch user from Clerk API for ${clerkId}:`, error)
      }
    }
    
    // Use finalEmail if we got one, otherwise keep existing email
    finalEmail = finalEmail || user.email
    
    // Update if:
    // 1. Role changed, OR
    // 2. Email changed (including replacing temp emails)
    const isTempEmail = user.email.includes("@temp.local")
    const emailChanged = finalEmail !== user.email
    const shouldUpdateEmail = emailChanged && (finalEmail !== user.email || isTempEmail)
    
    if (user.role !== finalRole || shouldUpdateEmail) {
      user = await prisma.user.update({
        where: { clerkId },
        data: { 
          role: finalRole, 
          email: finalEmail 
        }
      })
      
      if (isTempEmail && !finalEmail.includes("@temp.local")) {
        console.log(`Replaced temp email for user ${clerkId}: ${user.email} -> ${finalEmail}`)
      }
    }
  }
  return { id: user.id, clerkId: user.clerkId, email: user.email, role: user.role as Role }
}