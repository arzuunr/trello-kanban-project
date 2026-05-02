'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  DndContext, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent, closestCorners
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Board { id: string; title: string; created_at: string; position: number }

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
    cursor: 'grab',
    position: 'relative' as const
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick} className="group">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '16px 16px 0 0', background: gradients[index % gradients.length] }} />
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}>
        <span style={{ fontSize: '18px' }}>📋</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontWeight: 700, color: 'white', fontSize: '18px', fontFamily: 'Syne, sans-serif' }}>{board.title}</h3>
          <p style={{ fontSize: '10px', color: '#4a3a6a', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {new Date(board.created_at).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#4a3a6a', fontSize: '24px', cursor: 'pointer' }}>×</button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [boards, setBoards] = useState<Board[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else { setUserEmail(session.user.email || ''); fetchBoards() }
    })
  }, [router])

  const fetchBoards = async () => {
    // Önce position, sonra created_at; NULL değerler için en sağlam yöntem budur
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) console.error("Veri çekme hatası:", error.message);
    if (data) setBoards(data);
    setLoading(false);
  }

  const createBoard = async () => {
    if (!newTitle.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const nextPos = boards.length > 0 ? Math.max(...boards.map(b => b.position || 0)) + 1 : 0

    const { data, error } = await supabase.from('boards')
      .insert({ title: newTitle.trim(), user_id: user?.id, position: nextPos })
      .select().single()

    if (error) {
      alert("Hata: " + error.message);
      return;
    }
    if (data) { setBoards(prev => [data, ...prev]); setNewTitle('') }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = boards.findIndex((i) => i.id === active.id)
    const newIndex = boards.findIndex((i) => i.id === over.id)
    const newArray = arrayMove(boards, oldIndex, newIndex)
    setBoards(newArray)
    newArray.forEach((item, idx) => {
      supabase.from('boards').update({ position: idx }).eq('id', item.id).then()
    })
  }

  const gradients = ['linear-gradient(135deg, #c084fc, #818cf8)', 'linear-gradient(135deg, #f472b6, #c084fc)', 'linear-gradient(135deg, #818cf8, #38bdf8)']

  return (
    <div style={{ background: '#06040f', minHeight: '100vh', color: '#f1eeff' }}>
      <header style={{ background: 'rgba(14,10,26,0.9)', borderBottom: '1px solid #2a1f45', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #c084fc, #f472b6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#06040f' }}>T</div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>TaskFlow</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '12px', color: '#4a3a6a' }}>{userEmail}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} style={{ background: 'transparent', border: '1px solid #2a1f45', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Çıkış</button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px', fontFamily: 'Syne, sans-serif' }}>Projelerim</h2>
          <p style={{ color: '#4a3a6a', fontSize: '14px' }}>Tahtalarını yönet ve sırala.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '60px' }}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createBoard()} placeholder="Yeni tahta adı..." style={{ flex: 1, background: '#130f22', border: '1px solid #2a1f45', borderRadius: '12px', padding: '14px 20px', color: 'white', outline: 'none' }} />
          <button onClick={createBoard} style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', border: 'none', borderRadius: '12px', padding: '0 32px', fontWeight: 'bold', cursor: 'pointer', color: '#06040f' }}>+ Tahta Oluştur</button>
        </div>

        {loading ? (
           <p style={{ color: '#4a3a6a', fontSize: '14px' }}>Yükleniyor...</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              <SortableContext items={boards.map(b => b.id)} strategy={rectSortingStrategy}>
                {boards.map((board, i) => (
                  <SortableBoardCard key={board.id} board={board} index={i} gradients={gradients} onClick={() => router.push(`/board/${board.id}`)} onDelete={(e) => { e.stopPropagation(); if(confirm('Silinsin mi?')) { supabase.from('boards').delete().eq('id', board.id).then(); setBoards(prev => prev.filter(b => b.id !== board.id)) } }} />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </main>
    </div>
  )
}
