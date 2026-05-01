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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">{userEmail}</p>
        </div>

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createBoard()}
            placeholder="New board title..."
            className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={createBoard}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Create Board
          </button>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : boards.length === 0 ? (
          <div className="text-slate-400 text-center py-12">No boards yet. Create one to get started!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, idx) => (
              <div
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                className={`${colors[idx % colors.length]} p-6 rounded-lg cursor-pointer hover:shadow-lg transition text-white`}
              >
                <h2 className="text-xl font-bold">{board.title}</h2>
                <p className="text-sm opacity-75">{new Date(board.created_at).toLocaleDateString()}</p>
                <button
                  onClick={(e) => deleteBoard(board.id, e)}
                  className="mt-4 text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
