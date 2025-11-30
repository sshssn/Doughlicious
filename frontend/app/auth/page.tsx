import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { serverComms } from "../../lib/servercomms"

export default async function AuthPage() {
  const { getToken } = await auth()
  const token = await getToken()
  if (!token) redirect("/")
  const me = await serverComms("auth/me", { headers: { Authorization: `Bearer ${token}` } })
  const role = me?.data?.role
  if (role === "admin") redirect("/dashboard")
  redirect("/")
}