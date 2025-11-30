import "dotenv/config"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load .env from root directory (two levels up from src/server.ts)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, "../../.env")
const localEnvPath = path.resolve(__dirname, "../../.env.local")

// Try root .env first, then fallback to .env.local for backward compatibility
dotenv.config({ path: rootEnvPath })
dotenv.config({ path: localEnvPath, override: false }) // Don't override if root .env exists
import http from "http"
import { ServerComms } from "./servercomms"
import { me } from "./api/auth"

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost")
  const method = req.method ?? "GET"

  // CORS headers - allow frontend to connect
  const origin = req.headers.origin
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL
  ].filter(Boolean)

  // Allow requests from allowed origins, or if no origin (server-side requests), allow in dev mode
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  } else if (!origin && process.env.NODE_ENV !== "production") {
    // Allow server-side requests (no origin header) in development
    res.setHeader("Access-Control-Allow-Origin", "*")
  } else if (process.env.NODE_ENV !== "production") {
    // Fallback for development
    res.setHeader("Access-Control-Allow-Origin", "*")
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.setHeader("Access-Control-Allow-Credentials", "true")

  // Handle preflight requests
  if (method === "OPTIONS") {
    res.statusCode = 200
    res.end()
    return
  }

  function sendJSON(status: number, body: unknown) {
    res.statusCode = status
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(body))
  }

  let bodyStr = ""
  req.on("data", chunk => (bodyStr += chunk))
  await new Promise(resolve => req.on("end", resolve))
  const isWebhook = url.pathname === "/webhook/stripe"
  const body = isWebhook ? undefined : (bodyStr ? JSON.parse(bodyStr) : undefined)
  const auth = req.headers["authorization"]
  const token = auth && auth.startsWith("Bearer ") ? auth.substring(7) : undefined

  try {
    // Health check endpoint
    if (url.pathname === "/health" && method === "GET") {
      return sendJSON(200, { status: "ok", timestamp: new Date().toISOString() })
    }

    if (url.pathname === "/products" && method === "GET") {
      const queryParams = {
        search: url.searchParams.get("search") || undefined,
        minPrice: url.searchParams.get("minPrice") || undefined,
        maxPrice: url.searchParams.get("maxPrice") || undefined,
        category: url.searchParams.get("category") || undefined
      }
      const data = await (await import("./api/products")).getProducts(token ?? "", queryParams)
      return sendJSON(200, data)
    }
    if (url.pathname === "/products/categories" && method === "GET") {
      const data = await (await import("./api/products")).getCategories()
      return sendJSON(200, data)
    }
    if (url.pathname?.startsWith("/products/") && method === "GET") {
      const id = url.pathname.split("/")[2]
      const data = await (await import("./api/products")).getProduct(token ?? "", id)
      return sendJSON(200, data)
    }
    if (url.pathname === "/orders" && method === "POST") {
      if (!token) {
        return sendJSON(401, { error: "Missing authorization token" })
      }
      const data = await ServerComms.createOrder(token, body)
      return sendJSON(200, { data })
    }
    if (url.pathname === "/checkout" && method === "POST") {
      if (!token) {
        return sendJSON(401, { error: "Missing authorization token" })
      }
      const data = await ServerComms.checkout(token, body)
      return sendJSON(200, { data })
    }
    if (url.pathname === "/auth/me" && method === "GET") {
      const data = await me(token ?? "")
      return sendJSON(200, data)
    }
    if (url.pathname === "/admin/products" && method === "GET") {
      const data = await (await import("./api/products")).getAdminProducts(token ?? "")
      return sendJSON(200, data)
    }
    if (url.pathname === "/admin/products" && method === "POST") {
      const data = await (await import("./api/products")).createProduct(token ?? "", body)
      return sendJSON(200, data)
    }
    if (url.pathname?.startsWith("/admin/products/") && method === "PATCH") {
      const id = url.pathname.split("/")[3] ?? url.pathname.split("/")[2]
      const data = await (await import("./api/products")).updateProduct(token ?? "", id, body)
      return sendJSON(200, data)
    }
    if (url.pathname?.startsWith("/admin/products/") && method === "DELETE") {
      const id = url.pathname.split("/")[3] ?? url.pathname.split("/")[2]
      const data = await (await import("./api/products")).deleteProduct(token ?? "", id)
      return sendJSON(200, data)
    }
    if (url.pathname === "/admin/orders" && method === "GET") {
      const data = await (await import("./api/orders")).listOrders(token ?? "")
      return sendJSON(200, data)
    }
    if (url.pathname?.startsWith("/admin/orders/") && method === "GET") {
      if (!token) {
        return sendJSON(401, { error: "Missing authorization token" })
      }
      const pathParts = url.pathname.split("/").filter(Boolean)
      const id = pathParts[pathParts.length - 1] // Get last part after /admin/orders/
      console.log(`[DEBUG] Admin order GET - pathname: ${url.pathname}, pathParts:`, pathParts, `id: ${id}`)
      if (!id) {
        return sendJSON(400, { error: "Order ID is required" })
      }
      try {
        const data = await (await import("./api/orders")).getOrder(token, id)
        return sendJSON(200, data)
      } catch (error: any) {
        console.error("Error fetching order:", error)
        const statusCode = error.message === "OrderNotFound" || error.message === "Forbidden" ? 404 : 500
        return sendJSON(statusCode, { error: error.message || "Order not found" })
      }
    }
    if (url.pathname?.startsWith("/admin/orders/") && method === "PATCH") {
      const pathParts = url.pathname.split("/").filter(Boolean)
      const id = pathParts[pathParts.length - 1] // Get last part after /admin/orders/
      if (!id) {
        return sendJSON(400, { error: "Order ID is required" })
      }
      try {
        const data = await (await import("./api/orders")).updateOrder(token ?? "", id, body)
        return sendJSON(200, data)
      } catch (error: any) {
        console.error("Error updating order:", error)
        return sendJSON(404, { error: error.message || "Order not found" })
      }
    }
    if (url.pathname === "/admin/users" && method === "GET") {
      const data = await (await import("./api/users")).listUsers(token ?? "")
      return sendJSON(200, data)
    }
    // Handle credit points: POST /admin/users/:userId/credit-points
    if (method === "POST" && url.pathname && url.pathname.startsWith("/admin/users/") && url.pathname.endsWith("/credit-points")) {
      if (!token) {
        return sendJSON(401, { error: "Missing authorization token" })
      }
      const pathParts = url.pathname.split("/").filter(Boolean)
      // pathParts should be: ["admin", "users", "userId", "credit-points"]
      const userId = pathParts.length >= 3 ? pathParts[2] : null
      if (!userId || userId === "users" || userId === "credit-points") {
        console.log(`[DEBUG] Invalid userId extraction - pathname: ${url.pathname}, pathParts:`, pathParts, `userId: ${userId}`)
        return sendJSON(400, { error: "User ID is required" })
      }
      try {
        const data = await (await import("./api/users")).creditUserPoints(token, userId, body)
        return sendJSON(200, data)
      } catch (error: any) {
        console.error("Error crediting points:", error)
        const statusCode = error.message === "UserNotFound" ? 404 : error.message === "Forbidden" ? 403 : 400
        return sendJSON(statusCode, { error: error.message || "Failed to credit points" })
      }
    }
    if (url.pathname === "/admin/kpis" && method === "GET") {
      const data = await (await import("./api/kpis")).kpis(token ?? "")
      return sendJSON(200, data)
    }
    if (url.pathname === "/my/orders" && method === "GET") {
      if (!token) {
        return sendJSON(401, { error: "Missing authorization token" })
      }
      const data = await (await import("./api/orders")).listMyOrders(token)
      return sendJSON(200, data)
    }
    if (url.pathname?.startsWith("/my/orders/") && method === "GET") {
      if (!token) {
        return sendJSON(401, { error: "Missing authorization token" })
      }
      const pathParts = url.pathname.split("/").filter(Boolean)
      const id = pathParts[pathParts.length - 1] // Get last part after /my/orders/
      console.log(`[DEBUG] Customer order GET - pathname: ${url.pathname}, pathParts:`, pathParts, `id: ${id}`)
      if (!id) {
        return sendJSON(400, { error: "Order ID is required" })
      }
      try {
        const data = await (await import("./api/orders")).getOrder(token, id)
        return sendJSON(200, data)
      } catch (error: any) {
        console.error("Error fetching order:", error)
        const statusCode = error.message === "OrderNotFound" || error.message === "Forbidden" ? 404 : 500
        return sendJSON(statusCode, { error: error.message || "Order not found" })
      }
    }
    if (url.pathname === "/my/kpis" && method === "GET") {
      if (!token) {
        return sendJSON(401, { error: "Missing authorization token" })
      }
      const data = await (await import("./api/my")).myKpis(token)
      return sendJSON(200, data)
    }
    if (url.pathname === "/webhook/clerk" && method === "POST") {
      const svixHeaders = {
        "svix-id": req.headers["svix-id"] as string,
        "svix-timestamp": req.headers["svix-timestamp"] as string,
        "svix-signature": req.headers["svix-signature"] as string,
      }
      // Pass raw body string for signature verification
      const result = await (await import("./api/webhook.clerk")).handleClerkWebhook({}, svixHeaders, bodyStr)
      if (result.success === false) {
        return sendJSON(400, result)
      }
      return sendJSON(200, result)
    }
    if (url.pathname === "/webhook/stripe" && method === "POST") {
      const sig = req.headers["stripe-signature"] as string
      const result = await (await import("./api/webhook.stripe")).handleStripeWebhook(bodyStr, sig)
      return sendJSON(200, result)
    }
    console.log(`[DEBUG] No route matched - pathname: ${url.pathname}, method: ${method}`)
    sendJSON(404, { error: "NotFound" })
  } catch (e: any) {
    console.error("[DEBUG] Server error:", e)
    sendJSON(400, { error: e.message ?? "Error" })
  }
})

server.listen(4000, () => {
  console.log("")
  console.log("✅ Backend server started successfully!")
  console.log("📍 Listening on http://localhost:4000")
  console.log("📍 Health check: http://localhost:4000/health")
  console.log("")
})