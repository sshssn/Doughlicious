"use client"

import { usePathname } from "next/navigation"
import { NavBar } from "./NavBar"

export function ConditionalNavBar() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/account")
  
  if (isDashboard) {
    return null
  }
  
  return <NavBar />
}

