export interface ReportRecord {
  id: string
  sr_no: number | null
  student_name: string
  student_id: string | null
  agent: string | null
  scholarship: string | null
  pending_invoice: string | null
  pending_amount: number
  yet_to_raised: string | null
  remarks: string | null
  dob: string | null
  document: string | null
  status: string | null
  intake: string | null
  end_date: string | null
  course: string | null
  admin_fee: number
  resource_fee: number
  tuition_fee: number
  total_fee: number
  paid_amount: number
  total_paid?: number | null
  follow_up?: string | null
  coe_issued_date: string | null
  email_id: string | null
  phone_no: string | null
  payment_status: string | null
  divided_month?: number | null
  calculation_breakup?: string | null
  created_at: string
  updated_at?: string
}

export interface ReportStats {
  totalStudents: number
  totalPendingAmount: number
  pendingInvoicesCount: number
  totalYetToRaised: number
}