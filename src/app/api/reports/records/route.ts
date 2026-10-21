import { NextRequest, NextResponse } from 'next/server'
import {
  createReportRecord,
  updateReportRecord,
  updateReportRecordsStatus,
  deleteReportRecord,
  deleteReportRecords,
} from '@/lib/services/report.service'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.student_name || !body.student_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Student Name is required.' },
        { status: 400 }
      )
    }

    const record = await createReportRecord(body)
    return NextResponse.json({ success: true, record })
  } catch (error: any) {
    console.error('Error creating report record:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create student record in live MySQL.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      const count = await updateReportRecordsStatus(body.ids, body.status || 'Current')
      return NextResponse.json({ success: true, count })
    }

    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Record ID is required for update.' },
        { status: 400 }
      )
    }

    const updatedRecord = await updateReportRecord(id, updates)
    if (!updatedRecord) {
      return NextResponse.json(
        { success: false, error: 'Record not found or failed to update.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, record: updatedRecord })
  } catch (error: any) {
    console.error('Error updating report record:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update student record in live MySQL.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      await deleteReportRecord(id)
      return NextResponse.json({ success: true, id })
    }

    // Bulk delete from body
    try {
      const body = await request.json()
      if (Array.isArray(body.ids) && body.ids.length > 0) {
        const count = await deleteReportRecords(body.ids)
        return NextResponse.json({ success: true, count })
      }
    } catch {}

    return NextResponse.json(
      { success: false, error: 'No record ID(s) provided.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error deleting report record:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete record from live MySQL.' },
      { status: 500 }
    )
  }
}