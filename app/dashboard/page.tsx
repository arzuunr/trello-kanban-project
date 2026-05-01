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

  return (
    <div className="min-h-screen bg-academic-light text-academic-dark font-sans">
      <header className="border-b border-gray-200 px-8 py-6 flex justify-between items-center bg-white">
        <h1 className="text-2xl font-serif font-bold tracking-tight text-black">TaskFlow</h1>
        <div className="flex items-center gap-6">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-medium">{userEmail}</span>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="text-xs uppercase tracking-widest font-bold border-b-2 border-black pb-1 hover:text-academic-accent hover:border-academic-accent transition-all"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-12">
        <div className="mb-16">
          <h2 className="text-4xl font-serif mb-2 italic">Dashboard</h2>
          <p className="text-gray-500 font-sans tracking-tight">Manage your projects with academic precision.</p>
        </div>

        {/* Input Alanı: Daha minimal, sadece alt çizgi tarzı */}
        <div className="flex gap-4 mb-12 border-b border-gray-100 pb-8">
          <input
            type="text"
            placeholder="New Project Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-transparent border-none text-xl font-serif italic focus:outline-none placeholder:text-gray-200"
          />
          <button
            onClick={createBoard}
            className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Create Board
          </button>
        </div>

        {/* Boards Grid: Daha sade, beyaz kağıt efekti */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => router.push(`/board/${board.id}`)}
              className="group border border-gray-100 p-8 hover:border-black transition-all cursor-pointer bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-serif text-2xl group-hover:italic transition-all">{board.title}</h3>
                <button onClick={(e) => deleteBoard(board.id, e)} className="text-gray-200 hover:text-black">×</button>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                Created: {new Date(board.created_at).toLocaleDateString('en-US')}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
