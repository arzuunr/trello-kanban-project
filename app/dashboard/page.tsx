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
  <div className="min-h-screen bg-cyber-black text-cyber-textMain font-mono">
    <header className="border-b border-cyber-border px-10 py-5 flex justify-between items-center bg-cyber-surface">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-cyber-neonBlue shadow-[0_0_8px_#00f3ff]" />
        <h1 className="text-xl font-black tracking-tighter">TASK_FLOW_v1.0</h1>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">ID: {userEmail}</span>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
          className="text-[10px] border border-cyber-neonPurple px-4 py-2 hover:bg-cyber-neonPurple hover:text-white transition-all">
          TERMINATE_SESSION
        </button>
      </div>
    </header>

    <main className="max-w-7xl mx-auto p-12">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white italic lowercase tracking-tighter">/dashboard</h2>
        <p className="text-cyber-neonBlue text-xs mt-2 opacity-80">{`> SYSTEM_STATUS: READY // ALL_MODULES_FUNCTIONAL`}</p>
      </div>

      {/* New Project Input: Kod satırı gibi */}
      <div className="bg-cyber-surface border border-cyber-border p-8 mb-12 shadow-xl">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-0 top-3 text-cyber-neonPurple text-lg font-bold">$</span>
            <input type="text" placeholder="NEW_PROJECT_NAME..." value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-transparent border-none pl-6 text-xl text-cyber-neonBlue placeholder:text-gray-800 focus:outline-none focus:ring-0"
            />
          </div>
          <button onClick={createBoard} className="bg-cyber-neonBlue text-black px-10 py-3 font-black uppercase text-xs hover:bg-white transition-all">
            INIT_PROJECT
          </button>
        </div>
      </div>

      {/* Project Grid: Hacker Tarzı ama Temiz */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <div key={board.id} onClick={() => router.push(`/board/${board.id}`)}
            className="group bg-cyber-surface border border-cyber-border p-8 hover:border-cyber-neonPurple transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white group-hover:text-cyber-neonPurple transition-colors tracking-tighter capitalize">{board.title}</h3>
              <button onClick={(e) => deleteBoard(board.id, e)} className="text-gray-700 hover:text-red-500">_DEL</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Created:</span>
              <span className="text-[10px] text-cyber-neonBlue font-mono">{new Date(board.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
)
}
