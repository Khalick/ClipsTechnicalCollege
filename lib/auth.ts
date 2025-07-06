import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export function verifyToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return { success: false, error: 'No token provided' }
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!)
    return { success: true, user: decoded }
  } catch (error) {
    return { success: false, error: 'Invalid token' }
  }
}