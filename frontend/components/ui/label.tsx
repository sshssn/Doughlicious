import { ReactNode } from "react"

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium mb-1">{children}</label>
}