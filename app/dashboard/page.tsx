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
      else { setUserEmail(session.user.email || ''); fetchBoards() }
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
      .insert({ title: newTitle.trim(), user_id: user?.id }).select().single()
    if (data) { setBoards([data, ...boards]); setNewTitle('') }
  }

  const deleteBoard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bu tahtayı silmek istediğinden emin misin?')) return
    await supabase.from('boards').delete().eq('id', id)
    setBoards(boards.filter(b => b.id !== id))
  }

  const gradients = [
    'linear-gradient(135deg, #c084fc, #818cf8)',
    'linear-gradient(135deg, #f472b6, #c084fc)',
    'linear-gradient(135deg, #818cf8, #38bdf8)',
    'linear-gradient(135deg, #34d399, #818cf8)',
    'linear-gradient(135deg, #fb923c, #f472b6)',
    'linear-gradient(135deg, #38bdf8, #34d399)',
  ]

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-[-30%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 65%)' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 65%)' }} />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#c084fc 1px, transparent 1px), linear-gradient(90deg, #c084fc 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <header className="relative border-b border-border/60 backdrop-blur-sm px-6 py-4 flex justify-between items-center"
        style={{ background: 'rgba(19,15,34,0.8)' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)' }}>
            <span className="text-xs font-bold text-void">T</span>
          </div>
          <span className="font-bold text-textMain tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>TaskFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-textDim hidden sm:block">{userEmail}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="text-xs text-textDim hover:text-accent border border-border hover:border-accent px-4 py-2 rounded-xl transition-all">
            Çıkış
          </button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10 animate-up">
          <h2 className="text-3xl font-bold text-textMain mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            Projelerim
          </h2>
          <p className="text-sm text-textDim">Tahtalarını yönet, takımını organize et.</p>
        </div>

        {/* Create board */}
        <div className="flex gap-3 mb-10">
          <input type="text" placeholder="Yeni tahta adı..."
            value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createBoard()}
            className="flex-1 bg-panel/80 border border-border rounded-xl px-4 py-3 text-sm text-textMain placeholder-muted focus:outline-none focus:border-accent transition-colors backdrop-blur" />
          <button onClick={createBoard}
            className="px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', color: '#06040f' }}>
            + Tahta
          </button>
        </div>

        {/* Boards */}
        {loading ? (
          <p className="text-textDim text-sm animate-pulse">Yükleniyor...</p>
        ) : boards.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="text-textDim">Henüz tahta yok. İlk tahtanı oluştur!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board, i) => (
              <div key={board.id} onClick={() => router.push(`/board/${board.id}`)}
                className="group relative bg-panel/60 backdrop-blur border border-border rounded-2xl p-5 cursor-pointer transition-all hover:border-accent/50 overflow-hidden"
                style={{ boxShadow: '0 0 0 0 rgba(192,132,252,0)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(192,132,252,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(192,132,252,0)')}>
                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: gradients[i % gradients.length] }} />
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: gradients[i % gradients.length] + '22', border: '1px solid rgba(192,132,252,0.2)' }}>
                  <span className="text-lg">📋</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-textMain group-hover:text-accent transition-colors"
                      style={{ fontFamily: 'Syne, sans-serif' }}>{board.title}</h3>
                    <p className="text-xs text-muted mt-1">
                      {new Date(board.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <button onClick={(e) => deleteBoard(board.id, e)}
                    className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xl leading-none">×</button>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-textDim group-hover:text-accent transition-colors">
                  <span>Aç</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
