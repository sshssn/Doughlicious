import { prisma } from "../db/client"
import { Webhook } from "svix"
import { ENV } from "../lib/env"

export async function handleClerkWebhook(payload: any, svixHeaders: Record<string, string>, rawBody: string) {
    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || ENV.CLERK_SECRET_KEY()
    
    if (!webhookSecret) {
        console.error("CLERK_WEBHOOK_SECRET not configured")
        return { success: false, error: "Webhook secret not configured" }
    }

    try {
        const wh = new Webhook(webhookSecret)
        const evt = wh.verify(rawBody, svixHeaders) as any
        payload = evt
    } catch (err) {
        console.error("Webhook verification failed:", err)
        return { success: false, error: "Invalid webhook signature" }
    }

    const eventType = payload.type
    console.log(`Processing Clerk webhook: ${eventType}`)

    if (eventType === "user.created") {
        const { id: clerkId, email_addresses, public_metadata } = payload.data
        
        // Prioritize verified email addresses, especially for OAuth providers like Gmail
        // Find the primary email or first verified email
        let email = email_addresses?.find((e: any) => e.id === payload.data.primary_email_address_id)?.email_address
        if (!email) {
            email = email_addresses?.find((e: any) => e.verification?.status === "verified")?.email_address
        }
        // Fallback to first email if no verified email found
        if (!email) {
            email = email_addresses?.[0]?.email_address
        }

        if (!email) {
            console.error("No email found for user:", clerkId, "email_addresses:", JSON.stringify(email_addresses))
            return { success: false, error: "No email" }
        }

        // Extract role from public metadata, default to 'customer'
        const role = (public_metadata?.role === "admin") ? "admin" : "customer"

        try {
            // Check if user already exists (might have been created by validateSession)
            const existingUser = await prisma.user.findUnique({ where: { clerkId } })
            
            if (existingUser) {
                // User exists - ALWAYS preserve admin role if set in DB
                const finalRole = existingUser.role === "admin" ? "admin" : role
                const updateData: any = { role: finalRole }
                
                // ALWAYS update email if:
                // 1. We have a valid email AND it's different, OR
                // 2. Current email is a temp email (contains @temp.local)
                const isTempEmail = existingUser.email.includes("@temp.local")
                if (email && email.trim() !== "" && (email !== existingUser.email || isTempEmail)) {
                    updateData.email = email
                }
                
                await prisma.user.update({
                    where: { clerkId },
                    data: updateData,
                })
                console.log(`User updated via webhook (created event): ${existingUser.email} -> ${email || existingUser.email} with role: ${finalRole}`)
            } else {
                // Create new user
                await prisma.user.create({
                    data: {
                        clerkId,
                        email,
                        role,
                    },
                })
                console.log(`User created: ${email} with role: ${role}`)
            }
            return { success: true }
        } catch (error) {
            console.error("Error creating/updating user:", error)
            return { success: false, error }
        }
    }

    if (eventType === "user.updated") {
        const { id: clerkId, email_addresses, public_metadata } = payload.data
        
        // Prioritize verified email addresses, especially for OAuth providers like Gmail
        // Find the primary email or first verified email
        let email = email_addresses?.find((e: any) => e.id === payload.data.primary_email_address_id)?.email_address
        if (!email) {
            email = email_addresses?.find((e: any) => e.verification?.status === "verified")?.email_address
        }
        // Fallback to first email if no verified email found
        if (!email) {
            email = email_addresses?.[0]?.email_address
        }

        if (!email) {
            console.error("No email found for user:", clerkId, "email_addresses:", JSON.stringify(email_addresses))
            return { success: false, error: "No email" }
        }

        // Extract role from public metadata
        const clerkRole = (public_metadata?.role === "admin") ? "admin" : "customer"

        try {
            // Check if user exists
            const existingUser = await prisma.user.findUnique({ where: { clerkId } })
            
            if (!existingUser) {
                // User doesn't exist, create them
                await prisma.user.create({
                    data: {
                        clerkId,
                        email,
                        role: clerkRole,
                    },
                })
                console.log(`User created via webhook: ${email} with role: ${clerkRole}`)
            } else {
                // User exists - ALWAYS preserve admin role if set in DB
                const finalRole = existingUser.role === "admin" ? "admin" : clerkRole
                
                const updateData: any = { role: finalRole }
                
                // ALWAYS update email if:
                // 1. We have a valid email AND it's different, OR
                // 2. Current email is a temp email (contains @temp.local)
                const isTempEmail = existingUser.email.includes("@temp.local")
                if (email && email.trim() !== "" && (email !== existingUser.email || isTempEmail)) {
                    updateData.email = email
                }
                
                await prisma.user.update({
                    where: { clerkId },
                    data: updateData,
                })
                console.log(`User updated: ${existingUser.email} -> ${email || existingUser.email} with role: ${finalRole}`)
            }
            return { success: true }
        } catch (error) {
            console.error("Error updating user:", error)
            return { success: false, error }
        }
    }

    return { success: true, message: "Event not handled" }
}
