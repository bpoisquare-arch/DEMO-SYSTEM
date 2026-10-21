'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Database, ShieldCheck } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@demo.com')

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/user-email=([^;]+)/)
      if (match && match[1]) {
        setEmail(decodeURIComponent(match[1]))
      }
    }
  }, [])

  const initials = email ? email.substring(0, 2).toUpperCase() : 'AD'

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
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between shadow-2xs sticky top-0 z-30 font-sans">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-extrabold text-[#003D5C] tracking-tight">
          Management Information System
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#00BF8F]/10 text-[#002D27] border border-[#00BF8F]/25">
          <span className="size-1.5 rounded-full bg-[#00BF8F] animate-pulse" />
          Faisal Shahid Entity
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Database status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
          <Database className="size-3.5 text-emerald-600" />
          <span>Hostinger MySQL Live</span>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800">{email}</span>
            <span className="text-[10px] font-extrabold text-[#00BF8F] uppercase tracking-wider flex items-center justify-end gap-1">
              <span className="size-1.5 rounded-full bg-[#25D366]" />
              Administrator
            </span>
          </div>

          <div className="size-8.5 rounded-xl bg-[#003D5C] text-cyan-300 text-xs font-extrabold flex items-center justify-center border border-[#003D5C]/20 shadow-xs">
            {initials}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8.5 px-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
            title="Log out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}