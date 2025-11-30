import "dotenv/config"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load .env from root directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, "../../.env")
const localEnvPath = path.resolve(__dirname, "../../.env.local")

dotenv.config({ path: rootEnvPath })
dotenv.config({ path: localEnvPath, override: false })

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000"

async function testEndpoint(method: string, endpoint: string, body?: unknown) {
  try {
    const url = `${BACKEND_URL}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json().catch(() => ({ error: "Invalid JSON response" }))

    return {
      success: response.ok,
      status: response.status,
      endpoint,
      data: data,
    }
  } catch (error: any) {
    return {
      success: false,
      status: 0,
      endpoint,
      error: error.message,
    }
  }
}

async function runTests() {
  console.log("🧪 Testing API Endpoints...\n")
  console.log(`Backend URL: ${BACKEND_URL}\n`)

  const results: Array<{ endpoint: string; success: boolean; status: number; error?: string }> = []

  // Test 1: Health Check
  console.log("1. Testing /health endpoint...")
  const health = await testEndpoint("GET", "/health")
  results.push(health)
  if (health.success) {
    console.log("   ✅ Health check passed")
  } else {
    console.log("   ❌ Health check failed:", health.error || `Status: ${health.status}`)
  }

  // Test 2: Get Products
  console.log("\n2. Testing GET /products endpoint...")
  const products = await testEndpoint("GET", "/products")
  results.push(products)
  if (products.success && products.data?.data) {
    const count = Array.isArray(products.data.data) ? products.data.data.length : 0
    console.log(`   ✅ Products endpoint working (${count} products found)`)
    if (count > 0 && products.data.data[0]) {
      console.log(`   Sample: ${products.data.data[0].name}`)
    }
  } else {
    console.log("   ❌ Products endpoint failed:", products.error || `Status: ${products.status}`)
    if (products.data?.error) {
      console.log("   Error message:", products.data.error)
    }
  }

  // Test 3: Get Single Product (if products exist)
  if (products.success && products.data?.data && Array.isArray(products.data.data) && products.data.data.length > 0) {
    const firstProductId = products.data.data[0].id
    console.log(`\n3. Testing GET /products/${firstProductId} endpoint...`)
    const product = await testEndpoint("GET", `/products/${firstProductId}`)
    results.push(product)
    if (product.success && product.data?.data) {
      console.log(`   ✅ Product detail endpoint working`)
      console.log(`   Product: ${product.data.data.name}`)
    } else {
      console.log("   ❌ Product detail endpoint failed:", product.error || `Status: ${product.status}`)
    }
  } else {
    console.log("\n3. Skipping product detail test (no products available)")
  }

  // Test 4: Auth endpoint (without token - should fail gracefully)
  console.log("\n4. Testing GET /auth/me endpoint (without token)...")
  const auth = await testEndpoint("GET", "/auth/me")
  results.push(auth)
  if (auth.status === 200 || auth.status === 401 || auth.status === 403) {
    console.log(`   ✅ Auth endpoint responding (Status: ${auth.status})`)
  } else {
    console.log("   ⚠️  Auth endpoint unexpected response:", auth.status)
  }

  // Summary
  console.log("\n" + "=".repeat(50))
  console.log("📊 Test Summary:")
  console.log("=".repeat(50))
  const passed = results.filter(r => r.success || (r.status >= 200 && r.status < 400)).length
  const failed = results.length - passed
  console.log(`Total tests: ${results.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log("\nDetailed Results:")
  results.forEach((r, i) => {
    const icon = r.success || (r.status >= 200 && r.status < 400) ? "✅" : "❌"
    console.log(`${i + 1}. ${icon} ${r.endpoint} - Status: ${r.status}`)
    if (r.error) {
      console.log(`   Error: ${r.error}`)
    }
  })

  if (failed === 0) {
    console.log("\n🎉 All tests passed!")
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check the errors above.`)
  }
}

runTests().catch(console.error)

