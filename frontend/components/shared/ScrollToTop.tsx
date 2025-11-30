"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  useEffect(() => {
    // Scroll to top on page load/refresh
    const handleLoad = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }

    // Scroll immediately on mount (handles refresh)
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })

    // Also handle load event for full page refreshes
    window.addEventListener("load", handleLoad)

    return () => {
      window.removeEventListener("load", handleLoad)
    }
  }, [])

  return null
}

