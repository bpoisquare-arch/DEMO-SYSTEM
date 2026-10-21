import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('dev-auth-session', '', { path: '/', maxAge: 0 })
  response.cookies.set('user-email', '', { path: '/', maxAge: 0 })
  return response
}