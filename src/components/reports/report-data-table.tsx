'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Download,
  RotateCcw,
  PlusCircle,
  Check,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import type { ReportRecord } from '@/types/database.types'
import TablePagination from '@/components/ui/table-pagination'
import { formatToDDMMYY } from '@/lib/utils'

interface ReportDataTableProps {
  records: ReportRecord[]
  isLoading?: boolean
  selectedIds: string[]
  onSelectChange: (ids: string[]) => void
  onViewRecord: (record: ReportRecord) => void
  onAddEntry?: () => void
  onEditRecord?: (record: ReportRecord) => void
  onDeleteRecord?: (record: ReportRecord) => Promise<void>
  onDeleteSelected?: (ids: string[]) => Promise<void>
  onClearStatusSelected?: (ids: string[]) => Promise<void>
  availableAgents?: string[]
  availableIntakes?: string[]
  onExportFiltered?: (exportRows: ReportRecord[]) => void
  onStatusUpdate?: (record: ReportRecord, status: string) => Promise<void>
}

type SortField = 'student_name' | 'pending_invoice' | 'pending_amount' | 'yet_to_raised' | 'course' | 'intake' | 'end_date'
type SortOrder = 'asc' | 'desc'

export default function ReportDataTable({
  records,
  isLoading = false,
  selectedIds,
  onSelectChange,
  onViewRecord,
  onAddEntry,
  onEditRecord,
  onDeleteRecord,
  onDeleteSelected,
  onClearStatusSelected,
  availableAgents = [],
  availableIntakes = [],
  onExportFiltered,
  onStatusUpdate,
}: ReportDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDocument, setSelectedDocument] = useState<string>('all')
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [selectedIntake, setSelectedIntake] = useState<string>('all')

  const [sortField, setSortField] = useState<SortField>('student_name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)

  const [recordToDelete, setRecordToDelete] = useState<ReportRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isBulkClearingStatus, setIsBulkClearingStatus] = useState(false)

  const availableDocuments = useMemo(() => {
    const set = new Set<string>(['CoE', 'VoE', 'Offer Letter', 'Passport', 'CNIC'])
    records.forEach((r) => {
      if (r.document && r.document.trim()) set.add(r.document.trim())
    })
    return Array.from(set)
  }, [records])

  const formatAUD = (amount: number | null | undefined) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const filteredRecords = useMemo(() => {
    let list = [...records]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter((r) => {
        return (
          r.student_name?.toLowerCase().includes(q) ||
          r.course?.toLowerCase().includes(q) ||
          r.student_id?.toLowerCase().includes(q) ||
          r.document?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q) ||
          r.agent?.toLowerCase().includes(q) ||
          r.email_id?.toLowerCase().includes(q) ||
          r.phone_no?.toLowerCase().includes(q) ||
          r.remarks?.toLowerCase().includes(q) ||
          (r.calculation_breakup && String(r.calculation_breakup).toLowerCase().includes(q)) ||
          (r.follow_up && String(r.follow_up).toLowerCase().includes(q))
        )
      })
    }

    if (selectedStatus !== 'all') {
      const target = selectedStatus.toLowerCase().trim()
      list = list.filter((r) => (r.status || '').toLowerCase().trim() === target)
    }

    if (selectedDocument !== 'all') {
      const target = selectedDocument.toLowerCase().trim()
      list = list.filter((r) => (r.document || '').toLowerCase().trim() === target)
    }

    if (selectedAgent !== 'all') {
      list = list.filter((r) => r.agent === selectedAgent)
    }

    if (selectedIntake !== 'all') {
      list = list.filter((r) => r.intake === selectedIntake)
    }

    list.sort((a, b) => {
      let valA: any = a[sortField] ?? ''
      let valB: any = b[sortField] ?? ''

      if (sortField === 'pending_amount') {
        valA = Number(valA) || 0
        valB = Number(valB) || 0
      } else if (sortField === 'yet_to_raised') {
        valA = parseFloat(String(valA).replace(/[^0-9.-]/g, '')) || 0
        valB = parseFloat(String(valB).replace(/[^0-9.-]/g, '')) || 0
      } else {
        valA = String(valA).toLowerCase()
        valB = String(valB).toLowerCase()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [records, searchTerm, selectedStatus, selectedDocument, selectedAgent, selectedIntake, sortField, sortOrder])

  const totalPages = Math.ceil(filteredRecords.length / pageSize)
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, currentPage, pageSize])

  const isAllSelected = paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.includes(r.id))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedRecords.map((r) => r.id)
      const merged = Array.from(new Set([...selectedIds, ...pageIds]))
      onSelectChange(merged)
    } else {
      const pageIds = new Set(paginatedRecords.map((r) => r.id))
      onSelectChange(selectedIds.filter((id) => !pageIds.has(id)))
    }
  }

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((item) => item !== id))
    } else {
      onSelectChange([...selectedIds, id])
    }
  }
  const handleConfirmDelete = async () => {
    if (!recordToDelete || !onDeleteRecord) return
    setIsDeleting(true)
    try {
      await onDeleteRecord(recordToDelete)
      setRecordToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteConfirm = async () => {
    if (!onDeleteSelected || selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected student records from live MySQL?`)) return
    setIsBulkDeleting(true)
    try {
      await onDeleteSelected(selectedIds)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleBulkClearConfirm = async () => {
    if (!onClearStatusSelected || selectedIds.length === 0) return
    setIsBulkClearingStatus(true)
    try {
      await onClearStatusSelected(selectedIds)
    } finally {
      setIsBulkClearingStatus(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Filter and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by student name, ID, course, agent..."
              className="pl-9 h-9.5 text-xs rounded-xl border-slate-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onExportFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportFiltered(filteredRecords)}
                className="h-9.5 px-3.5 text-xs font-semibold gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="size-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </Button>
            )}

            {onAddEntry && (
              <Button
                size="sm"
                onClick={onAddEntry}
                className="h-9.5 px-4 text-xs font-bold gap-1.5 rounded-xl bg-gradient-to-r from-[#003D5C] to-[#00283d] text-cyan-300 hover:from-[#00283d] hover:to-[#001824] shadow-xs cursor-pointer border border-cyan-400/20"
              >
                <PlusCircle className="size-4 text-cyan-300" />
                <span>Add Student Entry</span>
              </Button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          {/* Document Filter */}
          <select
            value={selectedDocument}
            onChange={(e) => {
              setSelectedDocument(e.target.value)
              setCurrentPage(1)
            }}
            className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009D9E]"
          >
            <option value="all">All Documents</option>
            {availableDocuments.map((doc) => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009D9E]"
          >
            <option value="all">All Statuses</option>
            <option value="Current">Current</option>
            <option value="Invoice Raised">Invoice Raised</option>
            <option value="Need Advise">Need Advise</option>
            <option value="Course End">Course End</option>
            <option value="Payment Received">Payment Received</option>
            <option value="Defaulter">Defaulter</option>
          </select>

          {/* Agent Filter */}
          {availableAgents.length > 0 && (
            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009D9E]"
            >
              <option value="all">All Agents</option>
              {availableAgents.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          )}

          {/* Intake Filter */}
          {availableIntakes.length > 0 && (
            <select
              value={selectedIntake}
              onChange={(e) => {
                setSelectedIntake(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#009D9E]"
            >
              <option value="all">All Intakes</option>
              {availableIntakes.map((itk) => (
                <option key={itk} value={itk}>{itk}</option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {(searchTerm || selectedStatus !== 'all' || selectedDocument !== 'all' || selectedAgent !== 'all' || selectedIntake !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSelectedStatus('all')
                setSelectedDocument('all')
                setSelectedAgent('all')
                setSelectedIntake('all')
                setCurrentPage(1)
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer ml-auto flex items-center gap-1"
            >
              <RotateCcw className="size-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#003D5C] to-[#002233] text-white p-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
            <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{selectedIds.length} record(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            {onClearStatusSelected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkClearConfirm}
                disabled={isBulkClearingStatus}
                className="h-8 bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-semibold rounded-xl"
              >
                Reset Status (Current)
              </Button>
            )}

            {onDeleteSelected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteConfirm}
                disabled={isBulkDeleting}
                className="h-8 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl gap-1.5"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Selected</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 3. Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-[#009D9E] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">Student Details</th>
                <th className="p-3">Course & Agency</th>
                <th className="p-3">Fee / Paid / Pending</th>
                <th className="p-3">Pending Inv / Unraised</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-[#009D9E]" />
                    <span>Loading live database records...</span>
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <AlertTriangle className="size-6 mx-auto mb-2 text-amber-500/80" />
                    <p className="font-semibold text-slate-700">No student records found.</p>
                    <p className="text-slate-400 text-xs mt-1">Try adjusting search filters or add a new record.</p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const isChecked = selectedIds.includes(r.id)
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-cyan-50/30' : ''}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(r.id)}
                          className="rounded text-[#009D9E] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-slate-400">
                        {r.sr_no || '-'}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{r.student_name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          {r.student_id && <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">ID: {r.student_id}</span>}
                          {r.document && <span className="text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded font-bold border border-cyan-200/60">{r.document}</span>}
                        </div>
                      </td>

                      <td className="p-3 max-w-[220px]">
                        <div className="font-semibold text-slate-800 truncate" title={r.course || ''}>
                          {r.course || '-'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={r.agent || ''}>
                          Agency: <strong className="text-slate-700">{r.agent || '-'}</strong>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-mono text-slate-800">Total: <strong>{formatAUD(r.total_fee)}</strong></div>
                        <div className="font-mono text-emerald-700 text-[11px]">Paid: {formatAUD(r.total_paid || r.paid_amount)}</div>
                        <div className="font-mono text-amber-600 font-extrabold text-[11px]">Pending: {formatAUD(r.pending_amount)}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-mono font-bold text-rose-600">Inv: {r.pending_invoice || '-'}</div>
                        <div className="font-mono text-cyan-800 font-semibold text-[11px]">Yet to Raised: {r.yet_to_raised ? `$${r.yet_to_raised}` : '$0'}</div>
                      </td>

                      <td className="p-3">
                        {onStatusUpdate ? (
                          <select
                            value={r.status || 'Current'}
                            onChange={(e) => onStatusUpdate(r, e.target.value)}
                            className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-bold text-[#003D5C] focus:outline-none focus:border-[#009D9E] cursor-pointer shadow-2xs"
                          >
                            <option value="Current">Current</option>
                            <option value="Invoice Raised">Invoice Raised</option>
                            <option value="Need Advise">Need Advise</option>
                            <option value="Course End">Course End</option>
                            <option value="Payment Received">Payment Received</option>
                            <option value="Defaulter">Defaulter</option>
                          </select>
                        ) : (
                          <Badge variant="outline" className="text-[11px] font-bold text-[#003D5C]">
                            {r.status || 'Current'}
                          </Badge>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewRecord(r)}
                            className="size-8 text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg"
                            title="View Record Details"
                          >
                            <Eye className="size-4" />
                          </Button>

                          {onEditRecord && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditRecord(r)}
                              className="size-8 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Edit Record"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                          )}

                          {onDeleteRecord && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRecordToDelete(r)}
                              className="size-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete Record"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Delete Record Confirmation Dialog */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="size-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="size-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Delete Student Record</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the student record for <strong className="text-slate-900 font-bold">{recordToDelete.student_name}</strong> from the live database? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecordToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span>Confirm Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}