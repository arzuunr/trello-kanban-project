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
    <div className="min-h-screen bg-cyber-black flex items-center justify-center font-mono">
      <div className="w-full max-w-md p-8 border border-cyber-neonBlue shadow-neon-blue bg-cyber-dark">
        <h1 className="text-3xl font-bold text-cyber-neonBlue mb-2 tracking-widest uppercase">
          ACCESS_GRANTED
        </h1>
        <p className="text-gray-500 text-xs mb-8 italic">{`// Please authenticate to enter the terminal`}</p>
        
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 px-3 text-xs font-bold tracking-widest transition-all ${
              !isRegister 
                ? 'bg-cyber-neonBlue text-black shadow-neon-blue' 
                : 'bg-cyber-border text-gray-400 hover:text-gray-200'
            }`}
          >
            GİRİŞ YAP
          </button>
          <button 
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 px-3 text-xs font-bold tracking-widest transition-all ${
              isRegister 
                ? 'bg-cyber-neonPurple text-black shadow-neon-purple' 
                : 'bg-cyber-border text-gray-400 hover:text-gray-200'
            }`}
          >
            ÜYE OL
          </button>
        </div>

        <div className="space-y-6">
          <input 
            type="email" 
            placeholder="USER_ID (Email)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-cyber-border p-3 text-cyber-neonBlue focus:border-cyber-neonPurple focus:outline-none transition-all"
          />
          <input 
            type="password" 
            placeholder="SECURITY_KEY (Password)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-cyber-border p-3 text-cyber-neonBlue focus:border-cyber-neonPurple focus:outline-none transition-all"
          />
          
          {error && (
            <div className="bg-cyber-neonRed/20 border border-cyber-neonRed p-3 text-cyber-neonRed text-xs">
              ⚠ {error}
            </div>
          )}

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-cyber-neonBlue text-black font-bold py-3 hover:bg-white transition-all shadow-neon-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'İŞLEMDE...' : isRegister ? 'REGISTER_NEW_USER' : 'INITIALIZE_LOGIN'}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            Auth_Secure_Protocol_v4.0
          </p>
        </div>
      </div>
    </div>
  )
}
