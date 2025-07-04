interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("adminToken")
    const isFormData = options.body instanceof FormData

    const headers: HeadersInit = {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    console.log("API Request:", { url, method: options.method || "GET" })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const contentType = response.headers.get("content-type")
    let data

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        data = { error: text || `HTTP ${response.status}: ${response.statusText}` }
      }
    }

    console.log("API Response:", { status: response.status, data })

    if (!response.ok) {
      throw new Error(
        data?.error
          ? `${data.error}${data.details ? ` – ${data.details}` : ""}`
          : `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    // Handle both success: true format and direct data format
    if (data.success !== undefined) {
      return { success: data.success, data: data.data || data }
    } else {
      return { success: true, data }
    }
  } catch (error) {
    console.error("API Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
