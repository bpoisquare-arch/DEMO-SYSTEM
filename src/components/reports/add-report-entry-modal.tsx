'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  User,
  GraduationCap,
  DollarSign,
  AlertCircle,
  Loader2,
  Calculator,
  Save,
  PlusCircle,
  Edit,
  X,
} from 'lucide-react'
import type { ReportRecord } from '@/types/database.types'
import { AIMT_COURSES } from '@/lib/courses'

interface AddReportEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (savedRecord: ReportRecord, isEdit: boolean) => void
  editRecord?: ReportRecord | null
}

function cleanScholarshipNumber(val: any): number {
  if (val === null || val === undefined || val === '' || val === '-') return 0
  if (typeof val === 'number') return isNaN(val) || val <= 0 ? 0 : val
  const str = String(val).trim()
  if (!str || str.includes('GMT') || str.includes('T00:00') || /^\d{4}-\d{2}-\d{2}/.test(str)) return 0
  const cleaned = str.replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) || num <= 0 || num > 100000 ? 0 : num
}

function computeYetToRaised(totFeeStr: string, totPaidStr: string, pendAmtStr: string): string {
  const totFee = parseFloat(totFeeStr) || 0
  const totPaid = parseFloat(totPaidStr) || 0
  const pendAmt = parseFloat(pendAmtStr) || 0
  if (totFee > 0) {
    const diff = Math.max(0, totFee - (totPaid + pendAmt))
    return String(Math.round(diff * 100) / 100)
  }
  return ''
}

function computeCalculationBreakup(yetToRaisedStr: string, dividedMonthStr: string): string {
  const Y = parseFloat(yetToRaisedStr) || 0
  const N = parseInt(dividedMonthStr, 10) || 0
  if (Y <= 0 || N <= 0 || !Number.isFinite(Y) || !Number.isFinite(N)) return ''
  const roundedY = Math.round(Y)
  if (N === 1) return `1 installment ${roundedY}`
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

export default function AddReportEntryModal({
  isOpen,
  onClose,
  onSuccess,
  editRecord,
}: AddReportEntryModalProps) {
  const isEditMode = Boolean(editRecord)

  const [formData, setFormData] = useState(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const nextYear = new Date(now)
    nextYear.setFullYear(now.getFullYear() + 1)
    const defaultEndDate = nextYear.toISOString().split('T')[0]
    return {
      student_name: '',
      student_id: '',
      agent: '',
      scholarship: '',
      pending_invoice: '',
      pending_amount: '',
      yet_to_raised: '',
      remarks: '',
      follow_up: '',
      dob: today,
      document: '',
      status: 'Current',
      intake: today,
      end_date: defaultEndDate,
      course: '',
      admin_fee: '',
      resource_fee: '',
      tuition_fee: '',
      total_fee: '',
      paid_amount: '',
      total_paid: '',
      coe_issued_date: today,
      email_id: '',
      phone_no: '',
      payment_status: 'Pending',
      divided_month: '',
      calculation_breakup: '',
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isManualTotalFee, setIsManualTotalFee] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
      if (editRecord) {
        setFormData({
          student_name: editRecord.student_name || '',
          student_id: editRecord.student_id || '',
          agent: editRecord.agent || '',
          scholarship: editRecord.scholarship || '',
          pending_invoice: editRecord.pending_invoice || '',
          pending_amount: editRecord.pending_amount ? String(editRecord.pending_amount) : '',
          yet_to_raised: editRecord.yet_to_raised || '',
          remarks: editRecord.remarks || '',
          follow_up: editRecord.follow_up || '',
          dob: editRecord.dob || '',
          document: editRecord.document || '',
          status: editRecord.status || 'Current',
          intake: editRecord.intake || '',
          end_date: editRecord.end_date || '',
          course: editRecord.course || '',
          admin_fee: editRecord.admin_fee ? String(editRecord.admin_fee) : '',
          resource_fee: editRecord.resource_fee ? String(editRecord.resource_fee) : '',
          tuition_fee: editRecord.tuition_fee ? String(editRecord.tuition_fee) : '',
          total_fee: editRecord.total_fee ? String(editRecord.total_fee) : '',
          paid_amount: editRecord.paid_amount ? String(editRecord.paid_amount) : '',
          total_paid: editRecord.total_paid !== null && editRecord.total_paid !== undefined ? String(editRecord.total_paid) : '',
          coe_issued_date: editRecord.coe_issued_date || '',
          email_id: editRecord.email_id || '',
          phone_no: editRecord.phone_no || '',
          payment_status: editRecord.payment_status || 'Pending',
          divided_month: editRecord.divided_month ? String(editRecord.divided_month) : '',
          calculation_breakup: editRecord.calculation_breakup || '',
        })
        setIsManualTotalFee(false)
      } else {
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const nextYear = new Date(now)
        nextYear.setFullYear(now.getFullYear() + 1)
        const defaultEndDate = nextYear.toISOString().split('T')[0]
        setFormData({
          student_name: '',
          student_id: '',
          agent: '',
          scholarship: '',
          pending_invoice: '',
          pending_amount: '',
          yet_to_raised: '',
          remarks: '',
          follow_up: '',
          dob: today,
          document: '',
          status: 'Current',
          intake: today,
          end_date: defaultEndDate,
          course: '',
          admin_fee: '',
          resource_fee: '',
          tuition_fee: '',
          total_fee: '',
          paid_amount: '',
          total_paid: '',
          coe_issued_date: today,
          email_id: '',
          phone_no: '',
          payment_status: 'Pending',
          divided_month: '',
          calculation_breakup: '',
        })
        setIsManualTotalFee(false)
      }
    }
  }, [isOpen, editRecord])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next: any = { ...prev, [field]: value }

      if (['admin_fee', 'resource_fee', 'tuition_fee', 'scholarship'].includes(field)) {
        if (!isManualTotalFee) {
          const a = parseFloat(field === 'admin_fee' ? value : next.admin_fee) || 0
          const r = parseFloat(field === 'resource_fee' ? value : next.resource_fee) || 0
          const t = parseFloat(field === 'tuition_fee' ? value : next.tuition_fee) || 0
          const s = cleanScholarshipNumber(field === 'scholarship' ? value : next.scholarship)
          const sum = a + r + t
          if (sum > 0) {
            next.total_fee = String(Math.max(0, sum - s))
          }
        }
      }

      if (['total_fee', 'total_paid', 'pending_amount', 'admin_fee', 'resource_fee', 'tuition_fee', 'scholarship'].includes(field)) {
        const computed = computeYetToRaised(next.total_fee, next.total_paid, next.pending_amount)
        if (computed) {
          next.yet_to_raised = computed
          if (next.divided_month) {
            next.calculation_breakup = computeCalculationBreakup(computed, next.divided_month)
          }
        }
      }

      if (field === 'divided_month' || field === 'yet_to_raised') {
        const yVal = field === 'yet_to_raised' ? value : next.yet_to_raised
        const dVal = field === 'divided_month' ? value : next.divided_month
        if (yVal && dVal) {
          next.calculation_breakup = computeCalculationBreakup(yVal, dVal)
        }
      }

      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.student_name.trim()) {
      setErrorMessage('Student Name is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const payload: any = {
        student_name: formData.student_name.trim(),
        student_id: formData.student_id.trim() || null,
        agent: formData.agent.trim() || null,
        scholarship: formData.scholarship.trim() || null,
        pending_invoice: formData.pending_invoice.trim() || null,
        pending_amount: parseFloat(formData.pending_amount) || 0,
        yet_to_raised: formData.yet_to_raised.trim() || null,
        remarks: formData.remarks.trim() || null,
        follow_up: formData.follow_up.trim() || null,
        dob: formData.dob || null,
        document: formData.document.trim() || null,
        status: formData.status.trim() || 'Current',
        intake: formData.intake || null,
        end_date: formData.end_date || null,
        course: formData.course.trim() || null,
        admin_fee: parseFloat(formData.admin_fee) || 0,
        resource_fee: parseFloat(formData.resource_fee) || 0,
        tuition_fee: parseFloat(formData.tuition_fee) || 0,
        total_fee: parseFloat(formData.total_fee) || 0,
        paid_amount: parseFloat(formData.paid_amount) || 0,
        total_paid: parseFloat(formData.total_paid) || 0,
        coe_issued_date: formData.coe_issued_date || null,
        email_id: formData.email_id.trim() || null,
        phone_no: formData.phone_no.trim() || null,
        payment_status: formData.payment_status || 'Pending',
        divided_month: formData.divided_month ? parseInt(formData.divided_month, 10) : null,
        calculation_breakup: formData.calculation_breakup.trim() || null,
      }

      const url = '/api/reports/records'
      const method = isEditMode ? 'PUT' : 'POST'
      if (isEditMode && editRecord) {
        payload.id = editRecord.id
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save record into live database.')
      }

      onSuccess(data.record, isEditMode)
      onClose()
    } catch (err: any) {
      console.error('Error saving record:', err)
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-4xl lg:max-w-5xl max-h-[92vh] bg-white border border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl rounded-2xl flex flex-col font-sans">
        <div className="relative bg-gradient-to-r from-[#002D42] via-[#003D5C] to-[#00283d] p-5 sm:p-6 text-white flex items-center justify-between shrink-0 border-b border-[#002D42]">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center border border-cyan-400/20 shadow-inner">
              {isEditMode ? <Edit className="size-5" /> : <PlusCircle className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                {isEditMode ? 'Edit Student Report Record' : 'Add New Student Report Entry'}
              </DialogTitle>
              <p className="text-xs text-cyan-200/80 mt-0.5 font-medium">
                Saves directly into Live Hostinger MySQL database.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003D5C] flex items-center gap-1.5 border-b pb-2">
              <User className="size-4 text-[#009D9E]" />
              <span>Student & Agency Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700">
                  Student Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={formData.student_name}
                  onChange={(e) => handleChange('student_name', e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="h-9.5 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Student ID</Label>
                <Input
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  placeholder="e.g. STU12345"
                  className="h-9.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Agent / Agency</Label>
                <Input
                  value={formData.agent}
                  onChange={(e) => handleChange('agent', e.target.value)}
                  placeholder="e.g. Global Education"
                  className="h-9.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                <Input
                  type="email"
                  value={formData.email_id}
                  onChange={(e) => handleChange('email_id', e.target.value)}
                  placeholder="student@example.com"
                  className="h-9.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Phone Number</Label>
                <Input
                  value={formData.phone_no}
                  onChange={(e) => handleChange('phone_no', e.target.value)}
                  placeholder="+61 400 000 000"
                  className="h-9.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003D5C] flex items-center gap-1.5 border-b pb-2">
              <GraduationCap className="size-4 text-[#009D9E]" />
              <span>Course & Enrollment Dates</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700">Course Name</Label>
                <div className="space-y-1.5">
                  <select
                    value={formData.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:outline-none focus:border-[#009D9E]"
                  >
                    <option value="">-- Select Course or type below --</option>
                    {AIMT_COURSES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.duration})
                      </option>
                    ))}
                  </select>
                  <Input
                    value={formData.course}
                    onChange={(e) => handleChange('course', e.target.value)}
                    placeholder="Or enter custom course name..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Document Type</Label>
                <select
                  value={formData.document}
                  onChange={(e) => handleChange('document', e.target.value)}
                  className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium focus:outline-none focus:border-[#009D9E]"
                >
                  <option value="">-- Select Document --</option>
                  <option value="CoE">CoE</option>
                  <option value="VoE">VoE</option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Passport">Passport</option>
                  <option value="CNIC">CNIC</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-[#003D5C] focus:outline-none focus:border-[#009D9E]"
                >
                  <option value="Current">Current</option>
                  <option value="Invoice Raised">Invoice Raised</option>
                  <option value="Need Advise">Need Advise</option>
                  <option value="Course End">Course End</option>
                  <option value="Payment Received">Payment Received</option>
                  <option value="Defaulter">Defaulter</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Date of Birth (DOB)</Label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className="h-9.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Intake Date</Label>
                <Input
                  type="date"
                  value={formData.intake}
                  onChange={(e) => handleChange('intake', e.target.value)}
                  className="h-9.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  className="h-9.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">CoE Issued Date</Label>
                <Input
                  type="date"
                  value={formData.coe_issued_date}
                  onChange={(e) => handleChange('coe_issued_date', e.target.value)}
                  className="h-9.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003D5C] flex items-center gap-1.5">
                <DollarSign className="size-4 text-[#009D9E]" />
                <span>Financial & Fee Breakdown</span>
              </h3>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isManualTotalFee}
                  onChange={(e) => setIsManualTotalFee(e.target.checked)}
                  className="rounded text-[#009D9E] focus:ring-0"
                />
                <span>Manual Total Fee Override</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Admin Fee ($)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.admin_fee}
                  onChange={(e) => handleChange('admin_fee', e.target.value)}
                  placeholder="0.00"
                  className="h-9.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Resource Fee ($)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.resource_fee}
                  onChange={(e) => handleChange('resource_fee', e.target.value)}
                  placeholder="0.00"
                  className="h-9.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Tuition Fee ($)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.tuition_fee}
                  onChange={(e) => handleChange('tuition_fee', e.target.value)}
                  placeholder="0.00"
                  className="h-9.5 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Scholarship ($)</Label>
                <Input
                  value={formData.scholarship}
                  onChange={(e) => handleChange('scholarship', e.target.value)}
                  placeholder="e.g. 500"
                  className="h-9.5 text-xs font-mono text-emerald-700 font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Total Fee ($)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.total_fee}
                  onChange={(e) => handleChange('total_fee', e.target.value)}
                  placeholder="0.00"
                  readOnly={!isManualTotalFee}
                  className={`h-9.5 text-xs font-mono font-bold ${
                    !isManualTotalFee ? 'bg-slate-50 text-[#003D5C]' : 'bg-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Total Paid ($)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.total_paid}
                  onChange={(e) => handleChange('total_paid', e.target.value)}
                  placeholder="0.00"
                  className="h-9.5 text-xs font-mono text-emerald-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Pending Amount ($)</Label>
                <Input
                  type="number"
                  step="any"
                  value={formData.pending_amount}
                  onChange={(e) => handleChange('pending_amount', e.target.value)}
                  placeholder="0.00"
                  className="h-9.5 text-xs font-mono text-amber-600 font-extrabold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Pending Invoice</Label>
                <Input
                  value={formData.pending_invoice}
                  onChange={(e) => handleChange('pending_invoice', e.target.value)}
                  placeholder="e.g. 1"
                  className="h-9.5 text-xs font-mono text-rose-600 font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Yet to Raised ($)</Label>
                <Input
                  value={formData.yet_to_raised}
                  onChange={(e) => handleChange('yet_to_raised', e.target.value)}
                  placeholder="e.g. 8100"
                  className="h-9.5 text-xs font-mono text-emerald-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Payment Plan Status</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {['Pending', 'Raised'].map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => handleChange('payment_status', st)}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                        formData.payment_status === st
                          ? 'bg-[#003D5C] text-white border-[#003D5C] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700">Divided Month (Installments count)</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.divided_month}
                  onChange={(e) => handleChange('divided_month', e.target.value)}
                  placeholder="e.g. 4"
                  className="h-9.5 text-xs font-mono font-bold text-[#003D5C]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#003D5C] flex items-center gap-1.5 border-b pb-2">
              <Calculator className="size-4 text-[#009D9E]" />
              <span>Installment Schedules & Calculation Breakup</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">Calculation BreakUp</Label>
                  {formData.calculation_breakup && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      Auto-Calculated
                    </span>
                  )}
                </div>
                <textarea
                  value={formData.calculation_breakup}
                  onChange={(e) => handleChange('calculation_breakup', e.target.value)}
                  placeholder="e.g. 4 installments 1750 or 5 installments 833 - Last Installment 835"
                  rows={2}
                  className="w-full text-xs p-3 bg-white border border-slate-200 text-[#003D5C] font-mono font-bold focus:border-[#009D9E] focus:outline-none rounded-xl resize-none shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Installment BreakUp / Remarks</Label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  placeholder="Enter notes, payment installments breakdown or schedule..."
                  rows={3}
                  className="w-full text-xs p-3 bg-white border border-slate-200 text-slate-900 focus:border-[#009D9E] focus:outline-none rounded-xl resize-none shadow-2xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Follow-up</Label>
                <textarea
                  value={formData.follow_up}
                  onChange={(e) => handleChange('follow_up', e.target.value)}
                  placeholder="Enter follow-up notes, student call history, discussion updates or reminders..."
                  rows={3}
                  className="w-full text-xs p-3 bg-white border border-slate-200 text-slate-900 focus:border-[#009D9E] focus:outline-none rounded-xl resize-none shadow-2xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#003D5C] to-[#00283d] hover:from-[#00283d] hover:to-[#001b2a] text-cyan-300 font-extrabold px-6 rounded-xl text-xs gap-2 shadow-md cursor-pointer border border-cyan-400/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin text-cyan-300" />
                  <span>Saving to Live MySQL...</span>
                </>
              ) : (
                <>
                  <Save className="size-4 text-cyan-300" />
                  <span>{isEditMode ? 'Update Database Record' : 'Save Live Entry'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}