import { validateSession } from "./services/auth.service"
import { ProductsService } from "./services/product.service"
import { OrdersService } from "./services/order.service"
import { PaymentService } from "./services/payment.service"

export const ServerComms = {
  async getProducts(sessionToken: string) {
    return ProductsService.getAll()
  },
  async createOrder(sessionToken: string, payload: { items: Array<{ productId: string; quantity: number }> }) {
    const user = await validateSession(sessionToken)
    return OrdersService.createOrder(user, payload)
  },
  async checkout(sessionToken: string, payload: { orderId: string }) {
    const user = await validateSession(sessionToken)
    return PaymentService.startCheckout(user, payload)
  }
}