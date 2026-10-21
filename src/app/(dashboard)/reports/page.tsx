'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  RotateCcw,
  GraduationCap,
} from 'lucide-react'
import ReportStatsCards from '@/components/reports/report-stats-cards'
import ReportDataTable from '@/components/reports/report-data-table'
import ReportRecordDetailModal from '@/components/reports/report-record-detail-modal'
import AddReportEntryModal from '@/components/reports/add-report-entry-modal'
import type { ReportRecord } from '@/types/database.types'

export default function StudentReportsPage() {
  const [records, setRecords] = useState<ReportRecord[]>([])
  const [availableAgents, setAvailableAgents] = useState<string[]>([])
  const [availableIntakes, setAvailableIntakes] = useState<string[]>([])

  const [isLoadingRecords, setIsLoadingRecords] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ReportRecord | null>(null)
  const [detailModalRecord, setDetailModalRecord] = useState<ReportRecord | null>(null)

  const [dbTotals, setDbTotals] = useState({
    totalStudents: 0,
    totalPendingAmount: 0,
    pendingInvoicesCount: 0,
    totalYetToRaised: 0,
  })

  const fetchRecords = useCallback(async () => {
    setIsLoadingRecords(true)
    try {
      const res = await fetch(`/api/reports?pageSize=5000&t=${Date.now()}`, {
        cache: 'no-store',
      })
      const data = await res.json()

      if (data.success && Array.isArray(data.records)) {
        setRecords(data.records)
        setAvailableAgents(data.availableAgents || [])
        setAvailableIntakes(data.availableIntakes || [])
        setDbTotals({
          totalStudents: data.totalCount || data.records.length,
          totalPendingAmount: data.totalPendingAmount || 0,
          pendingInvoicesCount: data.pendingInvoicesCount || 0,
          totalYetToRaised: data.totalYetToRaised || 0,
        })
      } else {
        setRecords([])
      }
    } catch (err) {
      console.error('Failed to load report records from live MySQL:', err)
    } finally {
      setIsLoadingRecords(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleRecordSaved = async () => {
    await fetchRecords()
  }

  const handleStatusUpdate = async (record: ReportRecord, newStatus: string) => {
    try {
      const res = await fetch('/api/reports/records', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, status: newStatus }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update record status.')
      }
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: newStatus } : r))
      )
    } catch (err: any) {
      console.error('Failed to update status:', err)
      alert(err.message || 'Failed to update status.')
    }
  }

  const handleDeleteRecord = async (record: ReportRecord) => {
    const res = await fetch(`/api/reports/records?id=${record.id}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete student record from live MySQL.')
    }
    await fetchRecords()
  }

  const handleBulkDelete = async (ids: string[]) => {
    if (ids.length === 0) return
    const res = await fetch('/api/reports/records', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    const data = await res.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete selected student records.')
    }
    setSelectedIds([])
    await fetchRecords()
  }

  const handleBulkStatusClear = async (ids: string[]) => {
    if (ids.length === 0) return
    try {
      const res = await fetch('/api/reports/records', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status: 'Current' }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to clear status for selected records.')
      }
      setRecords((prev) =>
        prev.map((r) => (ids.includes(r.id) ? { ...r, status: 'Current' } : r))
      )
      setSelectedIds([])
    } catch (err: any) {
      console.error('Failed to clear status:', err)
      alert(err.message || 'Failed to clear status.')
    }
  }

  const handleExportToExcel = async (customRows?: ReportRecord[]) => {
    const exportRows = customRows || (
      selectedIds.length > 0
        ? records.filter((r) => selectedIds.includes(r.id))
        : records
    )

    if (exportRows.length === 0) {
      alert('No records available to export.')
      return
    }

    try {
      const res = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: exportRows }),
      })

      if (!res.ok) throw new Error('Export request failed.')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Faisal_Shahid_Report_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Export error:', err)
      alert(err.message || 'Failed to export Excel report.')
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-14 font-sans">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-slate-50/70 to-slate-50 border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003D5C] via-[#009D9E] to-cyan-400" />

        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-[#003D5C] to-[#002233] text-cyan-300 flex items-center justify-center shadow-md shadow-[#003D5C]/20 shrink-0 border border-cyan-500/20">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#003D5C] tracking-tight">
                Student Report Management
              </h1>
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-900 border border-cyan-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                <span className="size-1.5 rounded-full bg-cyan-600 animate-pulse" />
                Faisal Shahid Entity
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Real-time student fee tracking, pending invoice management, live ledger, and Excel reports.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRecords()}
            disabled={isLoadingRecords}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 h-9.5 px-3.5 rounded-xl text-xs gap-2 font-semibold cursor-pointer"
            title="Refresh database records"
          >
            <RotateCcw className={`size-3.5 text-[#009D9E] ${isLoadingRecords ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <ReportStatsCards
        totalStudents={dbTotals.totalStudents}
        totalPendingAmount={dbTotals.totalPendingAmount}
        pendingInvoicesCount={dbTotals.pendingInvoicesCount}
        totalYetToRaised={dbTotals.totalYetToRaised}
        selectedCount={selectedIds.length}
      />

      {/* 3. Interactive Data Table */}
      <ReportDataTable
        records={records}
        isLoading={isLoadingRecords}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onViewRecord={(record) => setDetailModalRecord(record)}
        onAddEntry={() => {
          setEditingRecord(null)
          setIsAddEntryModalOpen(true)
        }}
        onEditRecord={(record) => {
          setEditingRecord(record)
          setIsAddEntryModalOpen(true)
        }}
        onDeleteRecord={handleDeleteRecord}
        onDeleteSelected={handleBulkDelete}
        onClearStatusSelected={handleBulkStatusClear}
        availableAgents={availableAgents}
        availableIntakes={availableIntakes}
        onExportFiltered={handleExportToExcel}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* 4. Modals */}
      <AddReportEntryModal
        isOpen={isAddEntryModalOpen}
        onClose={() => {
          setIsAddEntryModalOpen(false)
          setEditingRecord(null)
        }}
        onSuccess={handleRecordSaved}
        editRecord={editingRecord}
      />

      <ReportRecordDetailModal
        isOpen={Boolean(detailModalRecord)}
        onClose={() => setDetailModalRecord(null)}
        record={detailModalRecord}
        onEdit={(record) => {
          setDetailModalRecord(null)
          setEditingRecord(record)
          setIsAddEntryModalOpen(true)
        }}
      />
    </div>
  )
}