"use client"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8">
        <img src="/logo.svg" alt="Doughlicious" className="h-24 w-24 object-contain mx-auto" />
      </div>
      <div className="w-full max-w-md flex justify-center">
        <SignUp afterSignUpUrl="/auth" signInUrl="/sign-in" appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-xl border-border/50"
          }
        }} />
      </div>
    </main>
  )
}