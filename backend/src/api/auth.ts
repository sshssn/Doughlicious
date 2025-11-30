import { validateSession } from "../services/auth.service"

export async function me(sessionToken: string) {
  const user = await validateSession(sessionToken)
  return { data: { id: user.id, role: user.role } }
}