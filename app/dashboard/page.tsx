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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{userEmail}</span>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tahtalarım</h2>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Yeni tahta adı..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createBoard()}
            className="flex-1 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={createBoard}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 whitespace-nowrap text-sm"
          >
            + Tahta Oluştur
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-16">Yükleniyor...</p>
        ) : boards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-500">Henüz tahta yok. İlk tahtanı oluştur!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, i) => (
              <div
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer border border-gray-100 overflow-hidden transition-all hover:-translate-y-0.5"
              >
                <div className={`h-2 ${colors[i % colors.length]}`} />
                <div className="p-5 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{board.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(board.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteBoard(board.id, e)}
                    className="text-gray-300 hover:text-red-500 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
