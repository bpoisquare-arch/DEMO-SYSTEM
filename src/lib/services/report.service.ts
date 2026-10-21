import { prisma } from '@/lib/prisma'
import type { ReportRecord, ReportStats } from '@/types/database.types'

function cleanString(val: any): string {
  if (val === null || val === undefined) return ''
  const str = String(val).trim()
  if (str === 'null' || str === 'undefined') return ''
  return str
}

function cleanNumber(val: any): number {
  if (val === null || val === undefined || val === '' || val === '-') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const str = String(val).replace(/[^0-9.-]/g, '')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

export function cleanScholarshipNumber(val: any): number {
  if (val === null || val === undefined || val === '' || val === '-') return 0
  if (typeof val === 'number') {
    if (isNaN(val) || val <= 0) return 0
    return val
  }
  const str = String(val).trim()
  if (!str) return 0
  if (
    str.includes('GMT') ||
    str.includes('T00:00') ||
    /^\d{4}-\d{2}-\d{2}/.test(str) ||
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(str)
  ) {
    return 0
  }
  const cleaned = str.replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  if (isNaN(num) || num <= 0) return 0
  if (num > 100000) return 0
  return num
}

export function computeYetToRaised(totFeeStr: string, totPaidStr: string, pendAmtStr: string): string {
  const totFee = parseFloat(totFeeStr) || 0
  const totPaid = parseFloat(totPaidStr) || 0
  const pendAmt = parseFloat(pendAmtStr) || 0
  if (totFee > 0) {
    const diff = Math.max(0, totFee - (totPaid + pendAmt))
    return String(Math.round(diff * 100) / 100)
  }
  return ''
}

export function computeCalculationBreakup(yetToRaisedStr: string, dividedMonthStr: string): string {
  const Y = parseFloat(yetToRaisedStr) || 0
  const N = parseInt(dividedMonthStr, 10) || 0

  if (Y <= 0 || N <= 0 || !Number.isFinite(Y) || !Number.isFinite(N)) {
    return ''
  }

  const roundedY = Math.round(Y)
  if (N === 1) {
    return `1 installment ${roundedY}`
  }

  if (roundedY % N === 0) {
    const amount = roundedY / N
    return `${N} installments ${amount}`
  }

  const baseAmount = Math.floor(roundedY / N)
  const firstCount = N - 1
  const firstSum = firstCount * baseAmount
  const lastAmount = roundedY - firstSum

  return `${firstCount} installments ${baseAmount} - Last Installment ${lastAmount}`
}

export function prismaRecordToSnake(r: any): ReportRecord {
  return {
    id: r.id,
    sr_no: r.srNo ?? null,
    student_name: r.studentName ?? '',
    student_id: r.studentId ?? null,
    agent: r.agent ?? null,
    scholarship: r.scholarship ?? null,
    pending_invoice: r.pendingInvoice ?? null,
    pending_amount: Number(r.pendingAmount ?? 0),
    yet_to_raised: r.yetToRaised ?? null,
    remarks: r.remarks ?? null,
    dob: r.dob ?? null,
    document: r.document ?? null,
    status: r.status ?? 'Current',
    intake: r.intake ?? null,
    end_date: r.endDate ?? null,
    course: r.course ?? null,
    admin_fee: Number(r.adminFee ?? 0),
    resource_fee: Number(r.resourceFee ?? 0),
    tuition_fee: Number(r.tuitionFee ?? 0),
    total_fee: Number(r.totalFee ?? 0),
    paid_amount: Number(r.paidAmount ?? 0),
    total_paid: r.totalPaid !== null && r.totalPaid !== undefined ? Number(r.totalPaid) : null,
    follow_up: r.followUp ?? null,
    coe_issued_date: r.coeIssuedDate ?? null,
    email_id: r.emailId ?? null,
    phone_no: r.phoneNo ?? null,
    payment_status: r.paymentStatus ?? 'Pending',
    divided_month: r.dividedMonth ?? null,
    calculation_breakup: r.calculationBreakup ?? null,
    created_at: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    updated_at: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
  }
}

export async function getReportRecords(params: {
  search?: string
  agent?: string
  intake?: string
  course?: string
  status?: string
  document?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<{
  records: ReportRecord[]
  totalCount: number
  totalPendingAmount: number
  pendingInvoicesCount: number
  totalYetToRaised: number
  availableAgents: string[]
  availableIntakes: string[]
  availableCourses: string[]
}> {
  try {
    const page = params.page || 1
    const pageSize = params.pageSize || 50
    const sortBy = params.sortBy || 'srNo'
    const sortOrder = params.sortOrder || 'asc'

    const where: any = {}
    if (params.agent && params.agent !== 'all') where.agent = params.agent
    if (params.intake && params.intake !== 'all') where.intake = params.intake
    if (params.course && params.course !== 'all') where.course = params.course
    if (params.document && params.document !== 'all') where.document = params.document
    if (params.status && params.status !== 'all') where.status = params.status

    if (params.search && params.search.trim()) {
      const q = params.search.trim()
      where.OR = [
        { studentName: { contains: q } },
        { studentId: { contains: q } },
        { agent: { contains: q } },
        { course: { contains: q } },
        { intake: { contains: q } },
        { remarks: { contains: q } },
        { emailId: { contains: q } },
        { phoneNo: { contains: q } },
        { calculationBreakup: { contains: q } },
      ]
    }

    const sortFieldMap: Record<string, string> = {
      sr_no: 'srNo',
      student_name: 'studentName',
      agent: 'agent',
      pending_amount: 'pendingAmount',
      yet_to_raised: 'yetToRaised',
      intake: 'intake',
      course: 'course',
      created_at: 'createdAt',
    }
    const prismaSort = sortFieldMap[sortBy] || sortBy || 'srNo'

    const totalCount = await prisma.reportRecord.count({ where })
    const rows = await prisma.reportRecord.findMany({
      where,
      orderBy: { [prismaSort]: sortOrder },
      ...(pageSize === -1 ? {} : { skip: (page - 1) * pageSize, take: pageSize }),
    })

    const allRecords = await prisma.reportRecord.findMany({
      select: {
        pendingAmount: true,
        pendingInvoice: true,
        yetToRaised: true,
        agent: true,
        intake: true,
        course: true,
      },
    })

    let totalPendingAmount = 0
    let pendingInvoicesCount = 0
    let totalYetToRaised = 0
    const agentSet = new Set<string>()
    const intakeSet = new Set<string>()
    const courseSet = new Set<string>()

    for (const r of allRecords) {
      totalPendingAmount += Number(r.pendingAmount ?? 0)
      totalYetToRaised += cleanNumber(r.yetToRaised)

      if (r.pendingInvoice && r.pendingInvoice !== '-' && r.pendingInvoice !== '0' && r.pendingInvoice !== '') {
        const parsedInv = parseFloat(String(r.pendingInvoice).replace(/[^0-9.-]/g, ''))
        pendingInvoicesCount += (!isNaN(parsedInv) && parsedInv > 0) ? Math.round(parsedInv) : 1
      }

      if (r.agent) agentSet.add(r.agent)
      if (r.intake) intakeSet.add(r.intake)
      if (r.course) courseSet.add(r.course)
    }

    return {
      records: rows.map(prismaRecordToSnake),
      totalCount,
      totalPendingAmount: Math.round(totalPendingAmount * 100) / 100,
      pendingInvoicesCount,
      totalYetToRaised: Math.round(totalYetToRaised * 100) / 100,
      availableAgents: Array.from(agentSet).sort(),
      availableIntakes: Array.from(intakeSet).sort(),
      availableCourses: Array.from(courseSet).sort(),
    }
  } catch (err) {
    console.warn('MySQL getReportRecords error:', err)
    return {
      records: [],
      totalCount: 0,
      totalPendingAmount: 0,
      pendingInvoicesCount: 0,
      totalYetToRaised: 0,
      availableAgents: [],
      availableIntakes: [],
      availableCourses: [],
    }
  }
}

export async function createReportRecord(data: Partial<ReportRecord>): Promise<ReportRecord> {
  const maxSr = await prisma.reportRecord.aggregate({ _max: { srNo: true } })
  const nextSr = (maxSr._max.srNo ?? 0) + 1

  const adminFee = cleanNumber(data.admin_fee)
  const resourceFee = cleanNumber(data.resource_fee)
  const tuitionFee = cleanNumber(data.tuition_fee)
  const scholarship = cleanString(data.scholarship)
  const scholarshipNum = cleanScholarshipNumber(scholarship)

  let totalFee = cleanNumber(data.total_fee)
  if (totalFee === 0 && (adminFee > 0 || resourceFee > 0 || tuitionFee > 0)) {
    totalFee = Math.max(0, adminFee + resourceFee + tuitionFee - scholarshipNum)
  }

  const totalPaid = cleanNumber(data.total_paid)
  const pendingAmount = cleanNumber(data.pending_amount)

  let yetToRaised = cleanString(data.yet_to_raised)
  if (!yetToRaised && totalFee > 0) {
    yetToRaised = computeYetToRaised(String(totalFee), String(totalPaid), String(pendingAmount))
  }

  let calculationBreakup = cleanString(data.calculation_breakup)
  const dividedMonth = data.divided_month ? parseInt(String(data.divided_month), 10) : null
  if (!calculationBreakup && yetToRaised && dividedMonth) {
    calculationBreakup = computeCalculationBreakup(yetToRaised, String(dividedMonth))
  }

  const created = await prisma.reportRecord.create({
    data: {
      srNo: data.sr_no || nextSr,
      studentName: cleanString(data.student_name),
      studentId: cleanString(data.student_id) || null,
      agent: cleanString(data.agent) || null,
      scholarship: scholarship || null,
      pendingInvoice: cleanString(data.pending_invoice) || null,
      pendingAmount,
      yetToRaised: yetToRaised || null,
      remarks: cleanString(data.remarks) || null,
      dob: cleanString(data.dob) || null,
      document: cleanString(data.document) || null,
      status: cleanString(data.status) || 'Current',
      intake: cleanString(data.intake) || null,
      endDate: cleanString(data.end_date) || null,
      course: cleanString(data.course) || null,
      adminFee,
      resourceFee,
      tuitionFee,
      totalFee,
      paidAmount: cleanNumber(data.paid_amount),
      totalPaid,
      followUp: cleanString(data.follow_up) || null,
      coeIssuedDate: cleanString(data.coe_issued_date) || null,
      emailId: cleanString(data.email_id) || null,
      phoneNo: cleanString(data.phone_no) || null,
      paymentStatus: cleanString(data.payment_status) || 'Pending',
      dividedMonth,
      calculationBreakup: calculationBreakup || null,
    },
  })

  return prismaRecordToSnake(created)
}

export async function updateReportRecord(id: string, data: Partial<ReportRecord>): Promise<ReportRecord | null> {
  const updateData: any = {}

  if (data.student_name !== undefined) updateData.studentName = cleanString(data.student_name)
  if (data.student_id !== undefined) updateData.studentId = cleanString(data.student_id) || null
  if (data.agent !== undefined) updateData.agent = cleanString(data.agent) || null
  if (data.scholarship !== undefined) updateData.scholarship = cleanString(data.scholarship) || null
  if (data.pending_invoice !== undefined) updateData.pendingInvoice = cleanString(data.pending_invoice) || null
  if (data.pending_amount !== undefined) updateData.pendingAmount = cleanNumber(data.pending_amount)
  if (data.yet_to_raised !== undefined) updateData.yetToRaised = cleanString(data.yet_to_raised) || null
  if (data.remarks !== undefined) updateData.remarks = cleanString(data.remarks) || null
  if (data.dob !== undefined) updateData.dob = cleanString(data.dob) || null
  if (data.document !== undefined) updateData.document = cleanString(data.document) || null
  if (data.status !== undefined) updateData.status = cleanString(data.status) || 'Current'
  if (data.intake !== undefined) updateData.intake = cleanString(data.intake) || null
  if (data.end_date !== undefined) updateData.endDate = cleanString(data.end_date) || null
  if (data.course !== undefined) updateData.course = cleanString(data.course) || null
  if (data.admin_fee !== undefined) updateData.adminFee = cleanNumber(data.admin_fee)
  if (data.resource_fee !== undefined) updateData.resourceFee = cleanNumber(data.resource_fee)
  if (data.tuition_fee !== undefined) updateData.tuitionFee = cleanNumber(data.tuition_fee)
  if (data.total_fee !== undefined) updateData.totalFee = cleanNumber(data.total_fee)
  if (data.paid_amount !== undefined) updateData.paidAmount = cleanNumber(data.paid_amount)
  if (data.total_paid !== undefined) updateData.totalPaid = cleanNumber(data.total_paid)
  if (data.follow_up !== undefined) updateData.followUp = cleanString(data.follow_up) || null
  if (data.coe_issued_date !== undefined) updateData.coeIssuedDate = cleanString(data.coe_issued_date) || null
  if (data.email_id !== undefined) updateData.emailId = cleanString(data.email_id) || null
  if (data.phone_no !== undefined) updateData.phoneNo = cleanString(data.phone_no) || null
  if (data.payment_status !== undefined) updateData.paymentStatus = cleanString(data.payment_status) || 'Pending'
  if (data.divided_month !== undefined) updateData.dividedMonth = data.divided_month ? parseInt(String(data.divided_month), 10) : null
  if (data.calculation_breakup !== undefined) updateData.calculationBreakup = cleanString(data.calculation_breakup) || null

  const updated = await prisma.reportRecord.update({
    where: { id },
    data: updateData,
  })

  return prismaRecordToSnake(updated)
}

export async function updateReportRecordsStatus(ids: string[], status: string): Promise<number> {
  const res = await prisma.reportRecord.updateMany({
    where: { id: { in: ids } },
    data: { status },
  })
  return res.count
}

export async function deleteReportRecord(id: string): Promise<boolean> {
  await prisma.reportRecord.delete({ where: { id } })
  return true
}

export async function deleteReportRecords(ids: string[]): Promise<number> {
  const res = await prisma.reportRecord.deleteMany({
    where: { id: { in: ids } },
  })
  return res.count
}