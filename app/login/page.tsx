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
    setLoading(true)
    setError('')
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">TaskFlow</h1>
          <p className="text-gray-500 mt-1">{isRegister ? 'Yeni hesap oluştur' : 'Hesabına giriş yap'}</p>
        </div>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <input
          type="password"
          placeholder="Şifre (min. 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Bekleyin...' : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
        <p className="text-center mt-5 text-sm text-gray-500">
          {isRegister ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-blue-600 ml-1 font-medium hover:underline"
          >
            {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </p>
      </div>
    </div>
  )
}
