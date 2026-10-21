import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'connected',
      database: 'Hostinger MySQL',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({
      status: 'disconnected',
      message: err.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}