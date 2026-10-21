'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap,
  Building2,
  LogOut,
  ArrowLeft,
  Database,
  Layers,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    document.cookie = 'dev-auth-session=; path=/; max-age=0'
    document.cookie = 'user-email=; path=/; max-age=0'
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-[#001E2F] text-white flex flex-col justify-between shrink-0 border-r border-[#002D42] h-screen font-sans">
      {/* Entity Top Header */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-[#003D5C] to-[#00BF8F] text-white flex items-center justify-center font-extrabold text-sm shadow-md border border-white/20 shrink-0">
            FS
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-white tracking-tight truncate">
              Faisal Shahid
            </h2>
            <p className="text-[11px] text-[#00BF8F] font-semibold truncate">
              Report Management Entity
            </p>
          </div>
        </div>

        {/* Switch Workspace link */}
        <div className="p-3">
          <Link
            href="/portal"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors group"
          >
            <ArrowLeft className="size-3.5 text-[#00BF8F] group-hover:-translate-x-0.5 transition-transform" />
            <span>Switch Workspace</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
            Modules
          </div>

          <Link
            href="/reports"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              pathname.startsWith('/reports')
                ? 'bg-gradient-to-r from-[#003D5C] to-[#00BF8F]/30 text-white border border-[#00BF8F]/30 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="size-4 text-[#00BF8F]" />
            <span>Student Reports</span>
          </Link>
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#00BF8F]">
            <Database className="size-3" />
            <span>Live Hostinger MySQL</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Entries are saved directly into the remote database.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}