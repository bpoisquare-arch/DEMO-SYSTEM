import { NextRequest, NextResponse } from 'next/server'
import { getReportRecords } from '@/lib/services/report.service'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const agent = searchParams.get('agent') || undefined
    const intake = searchParams.get('intake') || undefined
    const course = searchParams.get('course') || undefined
    const status = searchParams.get('status') || undefined
    const document = searchParams.get('document') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '5000', 10)
    const sortBy = searchParams.get('sortBy') || 'sr_no'
    const sortOrder = (searchParams.get('sortOrder') as any) || 'asc'

    const result = await getReportRecords({
      search,
      agent,
      intake,
      course,
      status,
      document,
      page,
      pageSize,
      sortBy,
      sortOrder,
    })

    return NextResponse.json({
      success: true,
      ...result,
      page,
      pageSize,
    })
  } catch (error: any) {
    console.error('Error in GET /api/reports:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}