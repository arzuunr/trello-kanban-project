'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Board { id: string; title: string; created_at: string }

export default function Dashboard() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else {
        setUserEmail(session.user.email || '')
        fetchBoards()
      }
    })
  }, [])

  const fetchBoards = async () => {
    const { data } = await supabase.from('boards').select('*').order('created_at', { ascending: false })
    if (data) setBoards(data)
    setLoading(false)
  }

  const createBoard = async () => {
    if (!newTitle.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('boards')
      .insert({ title: newTitle.trim(), user_id: user?.id })
      .select().single()
    if (data) { setBoards([data, ...boards]); setNewTitle('') }
  }

  const deleteBoard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bu tahtayı silmek istediğinden emin misin?')) return
    await supabase.from('boards').delete().eq('id', id)
    setBoards(boards.filter(b => b.id !== id))
  }

  const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500']

// app/dashboard/page.tsx
return (
  <div className="min-h-screen bg-[#030303] text-[#e0e0e0] font-mono">
    {/* Navigasyon: Terminal Header */}
    <header className="border-b border-[#1a1a1a] px-10 py-5 flex justify-between items-center bg-[#0a0a0a]">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-[#00f3ff] animate-pulse" />
        <h1 className="text-lg font-black tracking-tighter">PROJECT_CONSOLE_v1</h1>
      </div>
      <span className="text-[9px] text-gray-600 font-bold tracking-[0.3em] uppercase">{userEmail}</span>
    </header>

    <main className="max-w-6xl mx-auto p-12">
      <div className="mb-16 border-l-2 border-[#9d00ff] pl-6">
        <h2 className="text-5xl font-black text-white lowercase tracking-tighter italic">/root/projects</h2>
        <p className="text-[#00f3ff] text-[10px] mt-2 opacity-70 tracking-widest">{`> SYSTEM_STATUS: STABLE // DIRECTORY_LOADED`}</p>
      </div>

      {/* Input Alanı: Komut Satırı Tarzı */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-1 mb-16 flex items-center shadow-2xl">
        <span className="px-6 text-[#9d00ff] font-bold">$</span>
        <input 
          type="text" 
          placeholder="NEW_PROJECT_UUID..." 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-transparent border-none py-4 text-[#00f3ff] placeholder:text-gray-800 focus:outline-none font-bold"
        />
        <button onClick={createBoard} className="bg-[#00f3ff] text-black px-8 py-4 font-black text-[10px] uppercase hover:bg-white transition-all">
          DEPLOY_MODULE
        </button>
      </div>

      {/* Proje Kartları: Mühendislik Dosyası Görünümü */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {boards.map((board) => (
          <div 
            key={board.id} 
            onClick={() => router.push(`/board/${board.id}`)}
            className="group bg-[#0a0a0a] border border-[#1a1a1a] p-8 hover:border-[#00f3ff] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-10">
              <h3 className="text-2xl font-bold text-white group-hover:text-[#00f3ff] transition-colors tracking-tighter uppercase leading-none">
                {board.title}
              </h3>
              <button onClick={(e) => deleteBoard(board.id, e)} className="text-gray-800 hover:text-red-600 font-bold text-[10px]">_PURGE</button>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold tracking-widest text-gray-600">
              <span>CREATED_AT: {new Date(board.created_at).toLocaleDateString()}</span>
              <span className="text-[#9d00ff]">VER: 0.1</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
)
}
