import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = request.cookies.get('dev-auth-session')?.value
  const email = request.cookies.get('user-email')?.value || 'admin@demo.com'

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email,
      role: session,
    },
  })
}