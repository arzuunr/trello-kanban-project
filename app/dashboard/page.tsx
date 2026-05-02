'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, DragStartEvent, DragEndEvent, closestCorners
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Board { id: string; title: string; created_at: string; position: number }

// --- Sortable Board Card Component ---
function SortableBoardCard({ board, index, gradients, onClick, onDelete }: { 
  board: Board; index: number; gradients: string[]; onClick: () => void; onDelete: (e: React.MouseEvent) => void 
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: board.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 1,
    background: '#130f22',
    border: '1px solid #2a1f45',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'grab'
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className="group relative transition-all hover:border-[#c084fc]/50">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: gradients[index % gradients.length] }} />
      <div className="w-10 h-10 rounded-xl mb-6 flex items-center justify-center" style={{ background: gradients[index % gradients.length] + '22', border: '1px solid rgba(192,132,252,0.2)' }}>
        <span className="text-lg">📋</span>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>{board.title}</h3>
          <p className="text-[10px] text-[#4a3a6a] mt-1 font-mono uppercase tracking-widest">
            Created: {new Date(board.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <button onClick={onDelete} className="text-[#4a3a6a] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-2xl leading-none">×</button>
      </div>
      <div className="mt-6 flex items-center gap-2 text-xs text-[#c084fc] font-bold group-hover:translate-x-1 transition-transform">
        <span>PROJECT_ACCESS</span>
        <span>→</span>
      </div>
    </div>
  )
}

// --- Main Dashboard Component ---
export default function Dashboard() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else { setUserEmail(session.user.email || ''); fetchBoards() }
    })
  }, [])

  const fetchBoards = async () => {
    const { data } = await supabase.from('boards').select('*').order('position', { ascending: true })
    if (data) setBoards(data)
    setLoading(false)
  }

  const createBoard = async () => {
    if (!newTitle.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const maxPos = boards.length > 0 ? Math.max(...boards.map(b => b.position || 0)) : 0
    const { data } = await supabase.from('boards')
      .insert({ title: newTitle.trim(), user_id: user?.id, position: maxPos + 1 }).select().single()
    if (data) { setBoards([...boards, data]); setNewTitle('') }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    setBoards((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      const newArray = arrayMove(items, oldIndex, newIndex)
      
      // Update database positions
      newArray.forEach((item, idx) => {
        supabase.from('boards').update({ position: idx }).eq('id', item.id).then()
      })
      
      return newArray
    })
  }

  const gradients = [
    'linear-gradient(135deg, #c084fc, #818cf8)',
    'linear-gradient(135deg, #f472b6, #c084fc)',
    'linear-gradient(135deg, #818cf8, #38bdf8)',
    'linear-gradient(135deg, #34d399, #818cf8)',
  ]

  return (
    <div style={{ background: '#06040f', minHeight: '100vh', color: '#f1eeff', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background Decor */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* HEADER FIX: Artık tamamen karanlık ve cam efektli */}
      <header style={{ background: 'rgba(14,10,26,0.9)', borderBottom: '1px solid #2a1f45', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #c084fc, #f472b6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#06040f' }}>T</div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' }}>TaskFlow</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '12px', color: '#4a3a6a', fontWeight: 600 }}>{userEmail}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            style={{ fontSize: '11px', background: 'transparent', border: '1px solid #2a1f45', color: '#f1eeff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Çıkış Yap
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>Projelerim</h2>
          <p style={{ color: '#4a3a6a', fontSize: '14px' }}>Sistemdeki aktif tahtalarını yönet ve sırala.</p>
        </div>

        {/* Create board input */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '60px' }}>
          <input type="text" placeholder="Yeni tahta adı başlat..."
            value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createBoard()}
            style={{ flex: 1, background: '#130f22', border: '1px solid #2a1f45', borderRadius: '12px', padding: '14px 20px', color: '#f1eeff', outline: 'none' }} />
          <button onClick={createBoard}
            style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', color: '#06040f', border: 'none', borderRadius: '12px', padding: '0 32px', fontWeight: 'bold', cursor: 'pointer' }}>
            + Tahta Oluştur
          </button>
        </div>

        {/* Dnd Context for Boards */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={({ active }) => setActiveId(active.id as string)} onDragEnd={handleDragEnd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            <SortableContext items={boards.map(b => b.id)} strategy={rectSortingStrategy}>
              {boards.map((board, i) => (
                <SortableBoardCard 
                  key={board.id} 
                  board={board} 
                  index={i} 
                  gradients={gradients} 
                  onClick={() => router.push(`/board/${board.id}`)}
                  onDelete={(e) => { e.stopPropagation(); if(confirm('Sil?')) { supabase.from('boards').delete().eq('id', board.id).then(); setBoards(boards.filter(b => b.id !== board.id)) } }}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </main>
    </div>
  )
}
