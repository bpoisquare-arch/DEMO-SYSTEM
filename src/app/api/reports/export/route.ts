import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import type { ReportRecord } from '@/types/database.types'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const records: ReportRecord[] = body.records || []

    if (!records || records.length === 0) {
      return NextResponse.json({ success: false, error: 'No records to export.' }, { status: 400 })
    }

    // Map rows for Excel export (NO admin comments as requested)
    const exportData = records.map((r, idx) => ({
      'Sr. No': r.sr_no || idx + 1,
      'Student Name': r.student_name || '',
      'Student ID': r.student_id || '',
      'Agent': r.agent || '',
      'Course': r.course || '',
      'Status': r.status || '',
      'Document': r.document || '',
      'Intake Date': r.intake || '',
      'End Date': r.end_date || '',
      'Date of Birth': r.dob || '',
      'CoE Issued Date': r.coe_issued_date || '',
      'Admin Fee ($)': r.admin_fee || 0,
      'Resource Fee ($)': r.resource_fee || 0,
      'Tuition Fee ($)': r.tuition_fee || 0,
      'Scholarship ($)': r.scholarship || '',
      'Total Fee ($)': r.total_fee || 0,
      'Paid Amount ($)': r.paid_amount || 0,
      'Total Paid ($)': r.total_paid || 0,
      'Pending Amount ($)': r.pending_amount || 0,
      'Pending Invoice': r.pending_invoice || '',
      'Yet to Raised ($)': r.yet_to_raised || '',
      'Payment Status': r.payment_status || '',
      'Divided Month': r.divided_month || '',
      'Calculation BreakUp': r.calculation_breakup || '',
      'Installment BreakUp / Remarks': r.remarks || '',
      'Follow-up': r.follow_up || '',
      'Email': r.email_id || '',
      'Phone': r.phone_no || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Reports')

    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Faisal_Shahid_Report_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating Excel export:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}