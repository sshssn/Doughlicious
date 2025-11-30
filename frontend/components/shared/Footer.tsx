"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PrivacyModal } from "./PrivacyModal"
import { TermsModal } from "./TermsModal"

export function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)

  return (
    <>
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto max-w-screen-2xl px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Doughlicious" className="h-16 w-16 object-contain" />
            </Link>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/menu" className="hover:text-foreground transition-colors">Menu</Link>
            <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
            <button 
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button 
              onClick={() => setTermsOpen(true)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Terms
            </button>
          </div>
        </div>
      </footer>
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    </>
  )
}