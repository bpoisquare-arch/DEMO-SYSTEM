'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  User,
  GraduationCap,
  Calendar,
  BookOpen,
  DollarSign,
  Mail,
  Phone,
  FileText,
  Copy,
  Building2,
  Calculator,
  MessageSquare,
  X,
} from 'lucide-react'
import type { ReportRecord } from '@/types/database.types'
import { formatToDDMMYY } from '@/lib/utils'

interface ReportRecordDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: ReportRecord | null
  onEdit?: (record: ReportRecord) => void
}

export default function ReportRecordDetailModal({
  isOpen,
  onClose,
  record,
  onEdit,
}: ReportRecordDetailModalProps) {
  if (!record) return null

  const formatAUD = (amount: number | null | undefined) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-4xl lg:max-w-5xl max-h-[92vh] bg-white border border-slate-200 text-slate-900 p-0 overflow-hidden shadow-2xl rounded-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#002D42] via-[#003D5C] to-[#00283d] p-5 sm:p-6 text-white flex items-center justify-between shrink-0 border-b border-[#002D42]">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-white/10 text-cyan-300 flex items-center justify-center font-extrabold text-sm border border-cyan-400/20 shadow-inner">
              {record.sr_no ? `#${record.sr_no}` : '#'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {record.student_name}
                </DialogTitle>
                <button
                  type="button"
                  onClick={() => copyToClipboard(record.student_name)}
                  className="p-1 text-cyan-300/70 hover:text-cyan-200 transition-colors cursor-pointer"
                  title="Copy student name"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                {record.student_id && (
                  <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                    ID: {record.student_id}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {record.status || 'Current'}
                </span>
                {record.document && (
                  <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded-md font-medium text-[11px]">
                    {record.document}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onEdit(record)
                }}
                className="bg-cyan-500/20 border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 text-xs font-bold"
              >
                Edit Entry
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Financial Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10.5px] uppercase font-bold text-slate-500 block">Total Fee</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-[#003D5C] mt-0.5 block">
                {formatAUD(record.total_fee)}
              </span>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
              <span className="text-[10.5px] uppercase font-bold text-emerald-700 block">Total Paid</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-800 mt-0.5 block">
                {formatAUD(record.total_paid || record.paid_amount)}
              </span>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/70">
              <span className="text-[10.5px] uppercase font-bold text-amber-700 block">Pending Amount</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-amber-700 mt-0.5 block">
                {formatAUD(record.pending_amount)}
              </span>
            </div>

            <div className="p-3.5 bg-cyan-50/60 rounded-2xl border border-cyan-200/70">
              <span className="text-[10.5px] uppercase font-bold text-cyan-800 block">Yet to Raised</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-cyan-900 mt-0.5 block">
                {record.yet_to_raised ? `$${record.yet_to_raised}` : '$0'}
              </span>
            </div>
          </div>

          {/* Course & Agency Details */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Course</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {record.course || '-'}
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 font-bold uppercase block">Agent / Agency</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {record.agent || '-'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Intake Date</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                  {formatToDDMMYY(record.intake)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">End Date</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                  {formatToDDMMYY(record.end_date)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CoE Issued Date</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                  {formatToDDMMYY(record.coe_issued_date)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Date of Birth (DOB)</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">
                  {formatToDDMMYY(record.dob)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
              <Mail className="size-4 text-[#009D9E] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Email</span>
                <span className="text-slate-900 font-semibold truncate block">{record.email_id || '-'}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
              <Phone className="size-4 text-[#009D9E] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Phone</span>
                <span className="text-slate-900 font-semibold font-mono">{record.phone_no || '-'}</span>
              </div>
            </div>
          </div>

          {/* Calculation BreakUp */}
          {record.calculation_breakup && (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 space-y-1 shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                <Calculator className="size-4 text-emerald-600" /> Calculation BreakUp:
              </span>
              <p className="whitespace-pre-wrap font-bold font-mono text-emerald-900">{record.calculation_breakup}</p>
            </div>
          )}

          {/* Installment BreakUp */}
          {record.remarks && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 space-y-1 shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-amber-800">
                <FileText className="size-4" /> Installment BreakUp:
              </span>
              <p className="whitespace-pre-wrap font-medium">{record.remarks}</p>
            </div>
          )}

          {/* Follow-up */}
          {record.follow_up && (
            <div className="p-4 rounded-2xl bg-cyan-50/90 border border-cyan-200 text-xs text-[#003D5C] space-y-1 shadow-2xs">
              <span className="font-extrabold flex items-center gap-1.5 text-[#009D9E]">
                <MessageSquare className="size-4" /> Follow-up Notes:
              </span>
              <p className="whitespace-pre-wrap font-medium">{record.follow_up}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 px-6 rounded-xl text-xs font-bold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}