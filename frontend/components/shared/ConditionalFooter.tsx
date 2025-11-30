"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./Footer"

export function ConditionalFooter() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/account")
  
  if (isDashboard) {
    return null
  }
  
  return <Footer />
}

