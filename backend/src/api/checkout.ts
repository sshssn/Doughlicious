import { validateSession } from "../services/auth.service"
import { PaymentService } from "../services/payment.service"

export async function checkout(sessionToken: string, payload: { orderId: string }) {
  const user = await validateSession(sessionToken)
  const result = await PaymentService.startCheckout(user, payload)
  return { data: result }
}