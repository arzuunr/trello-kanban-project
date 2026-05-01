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

  // app/login/page.tsx return kısmı
return (
  <div className="min-h-screen bg-cyber-black flex items-center justify-center font-mono">
    <div className="w-full max-w-md p-8 border border-cyber-neonBlue shadow-neon-blue bg-cyber-dark">
      <h1 className="text-3xl font-bold text-cyber-neonBlue mb-2 tracking-widest uppercase">
        ACCESS_GRANTED
      </h1>
      <p className="text-gray-500 text-xs mb-8 italic">{`// Please authenticate to enter the terminal`}</p>
      
      <div className="space-y-6">
        <input 
          type="email" 
          placeholder="USER_ID (Email)"
          className="w-full bg-black border border-cyber-border p-3 text-cyber-neonBlue focus:border-cyber-neonPurple focus:outline-none transition-all"
        />
        <input 
          type="password" 
          placeholder="SECURITY_KEY (Password)"
          className="w-full bg-black border border-cyber-border p-3 text-cyber-neonBlue focus:border-cyber-neonPurple focus:outline-none transition-all"
        />
        <button className="w-full bg-cyber-neonBlue text-black font-bold py-3 hover:bg-white transition-all shadow-neon-blue">
          INITIALIZE_LOGIN
        </button>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          Auth_Secure_Protocol_v4.0
        </p>
      </div>
    </div>
  </div>
);

