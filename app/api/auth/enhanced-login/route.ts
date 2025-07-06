import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'
import { loginRateLimit } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = loginRateLimit(request)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || ''
          }
        }
      )
    }

    const { username, password, userType = 'student' } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    let user = null
    let tableName = userType === 'admin' ? 'admins' : 'students'
    let usernameField = userType === 'admin' ? 'username' : 'registration_number'

    // Fetch user from database
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq(usernameField, username)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, data.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: data.id, 
        username: data[usernameField],
        userType,
        name: data.name || data.username
      },
      process.env.SECRET_KEY!,
      { expiresIn: '24h' }
    )

    // Check if first login (password reset required)
    const requiresPasswordReset = data.first_login === true

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: data.id,
          name: data.name || data.username,
          username: data[usernameField],
          userType,
          requiresPasswordReset
        }
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        }
      }
    )

  } catch (error) {
    console.error('Enhanced login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}