'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('E-posta ve şifre gerekli.'); return }
    setLoading(true); setError('')
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message); else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message); else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full glow"
        style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full glow"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(#c084fc 1px, transparent 1px), linear-gradient(90deg, #c084fc 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative w-full max-w-sm animate-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-panel/80 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent glow" />
            <span className="text-xs text-textDim tracking-widest uppercase font-medium">TaskFlow</span>
          </div>
          <h1 className="text-3xl font-bold text-textMain" style={{ fontFamily: 'Syne, sans-serif' }}>
            {isRegister ? 'Hesap Oluştur' : 'Hoş Geldin'}
          </h1>
          <p className="text-sm text-textDim mt-2">
            {isRegister ? 'Takımına katıl, üretken ol.' : 'Takımının tahtalarına giriş yap.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-panel/80 backdrop-blur border border-border rounded-2xl p-6 space-y-4"
          style={{ boxShadow: '0 0 40px rgba(192,132,252,0.08)' }}>
          <div>
            <label className="block text-xs text-textDim mb-1.5 font-medium uppercase tracking-wider">E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="dev@takım.io"
              className="w-full bg-void border border-border rounded-xl px-4 py-3 text-sm text-textMain placeholder-muted focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-textDim mb-1.5 font-medium uppercase tracking-wider">Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="min. 6 karakter"
              className="w-full bg-void border border-border rounded-xl px-4 py-3 text-sm text-textMain placeholder-muted focus:outline-none focus:border-accent transition-colors" />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', color: '#06040f' }}>
            {loading ? '...' : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </div>

        <p className="text-center mt-5 text-xs text-textDim">
          {isRegister ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
          {' '}
          <button onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-accent hover:underline font-medium">
            {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </p>
      </div>
    </div>
  )
}
