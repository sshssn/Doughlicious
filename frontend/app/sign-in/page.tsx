"use client"
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8">
        <img src="/logo.svg" alt="Doughlicious" className="h-24 w-24 object-contain mx-auto" />
      </div>
      <div className="w-full max-w-md flex justify-center">
        <SignIn afterSignInUrl="/auth" signUpUrl="/sign-up" appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-xl border-border/50"
          }
        }} />
      </div>
    </main>
  )
}