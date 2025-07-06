import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(options: {
  windowMs: number
  maxRequests: number
}) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const key = `${ip}:${req.nextUrl.pathname}`
    const now = Date.now()
    
    // Clean up expired entries
    if (store[key] && now > store[key].resetTime) {
      delete store[key]
    }
    
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      }
      return { success: true, remaining: options.maxRequests - 1 }
    }
    
    if (store[key].count >= options.maxRequests) {
      return { 
        success: false, 
        remaining: 0,
        resetTime: store[key].resetTime 
      }
    }
    
    store[key].count++
    return { 
      success: true, 
      remaining: options.maxRequests - store[key].count 
    }
  }
}

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
})