import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const cleanEmail = String(email || '').trim().toLowerCase()

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // Default admin credential or any admin user
    // In production/MySQL, this can also check the users table
    const user = {
      id: 'admin-user-1',
      email: cleanEmail,
      name: 'Faisal Shahid Admin',
      role: 'admin',
    }

    const response = NextResponse.json({ success: true, user })

    // Set cookie
    response.cookies.set('dev-auth-session', 'admin', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    })
    response.cookies.set('user-email', cleanEmail, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}