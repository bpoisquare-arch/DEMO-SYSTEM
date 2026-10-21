'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, Loader2, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@mis.isquarebpo.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password.')
      }

      router.push('/portal')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-x-hidden">
      {/* Left Column: Full-height Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#001E2F] select-none overflow-hidden min-h-screen">
        <img
          src="/loginpage.png"
          alt="ISquare BPO"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-8 text-xs text-white/80 font-medium tracking-wide">
          © {new Date().getFullYear()} ISquare BPO. All rights reserved.
        </div>
      </div>

      {/* Right Column: Clean Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14 xl:p-20 bg-white min-h-screen">
        <div className="w-full max-w-[420px] space-y-7">
          {/* Mobile Branding */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <img src="/isquarebpo.png" alt="ISquare BPO" className="h-10 w-auto object-contain" />
            <div>
              <h2 className="text-sm font-bold text-[#001E2F] leading-tight">ISquare BPO</h2>
              <p className="text-[11px] text-slate-500 font-medium">Management Information System</p>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00BF8F]/10 text-[#002D27] text-[11px] font-bold border border-[#00BF8F]/20 mb-3">
              <ShieldCheck className="size-3.5 text-[#00BF8F]" />
              Secure Enterprise Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001E2F] tracking-tight">
              Sign In to MIS
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Enter your credentials to access the multi-entity workspace.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Email Address</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@isquarebpo.com"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Password</Label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-xs rounded-xl border-slate-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl bg-[#001E2F] hover:bg-[#002D42] text-white font-bold text-xs gap-2 shadow-md cursor-pointer transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-[#00BF8F]" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="size-4 text-[#00BF8F]" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            Faisal Shahid MIS Client Workspace • Live Hostinger MySQL
          </div>
        </div>
      </div>
    </div>
  )
}