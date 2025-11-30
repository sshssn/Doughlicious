type Options = { method?: string; data?: unknown; headers?: Record<string, string> }

export async function serverComms(endpoint: string, options: Options = {}) {
  const { method = "GET", data, headers } = options
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"
  const url = `${backendUrl}/${endpoint.replace(/^\//, '')}` // Remove leading slash if present
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json", 
        ...(headers ?? {}) 
      },
      body: data ? JSON.stringify(data) : undefined
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unable to read error response')
      
      // Try to parse error if it's JSON
      let errorData = null
      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Not JSON, use text
      }
      
      const errorMessage = errorData?.error || `${res.status}: ${res.statusText}`
      const isDatabaseError = errorMessage.includes("database") || 
                             errorMessage.includes("Can't reach") ||
                             errorMessage.includes("prisma") ||
                             errorMessage.includes("pooler.supabase")
      
      // Log validation errors (400) in development to help debug
      if (process.env.NODE_ENV === 'development' && res.status === 400) {
        console.error(`API Error: ${res.status} ${res.statusText} for ${url}`)
        console.error('Error response:', errorText)
      } else if (process.env.NODE_ENV === 'development' && res.status !== 404 && !isDatabaseError) {
        console.error(`API Error: ${res.status} ${res.statusText} for ${url}`)
        console.error('Error response:', errorText)
      }
      
      return { 
        error: errorMessage, 
        data: null,
        status: res.status
      }
    }

    const jsonData = await res.json()
    return jsonData
  } catch (error: unknown) {
    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Request timeout for', url)
        return { error: 'Request timeout - backend server may be unreachable', data: null }
      }
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        console.error('Connection failed to backend at', url)
        console.error('Make sure the backend server is running on', backendUrl)
        return { error: 'Cannot connect to backend server. Please ensure it is running.', data: null }
      }
      console.error('Fetch error for', url, error)
      return { error: error.message, data: null }
    }
    console.error('Unknown error for', url, error)
    return { error: String(error), data: null }
  }
}