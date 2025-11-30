"use client"

import { Button } from "../ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function RetryButton() {
  const router = useRouter()
  
  return (
    <Button 
      variant="outline" 
      className="mt-4 gap-2"
      onClick={() => router.refresh()}
    >
      <RefreshCw className="h-4 w-4" />
      Retry
    </Button>
  )
}

