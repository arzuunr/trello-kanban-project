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
    'use client'
import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, DragStartEvent, DragEndEvent, DragOverEvent,
  closestCorners,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { supabase } from '@/lib/supabase'
import ColumnContainer from './ColumnContainer'
import CardItem from './CardItem'

export interface CardType {
  id: string
  column_id: string
  title: string
  description: string | null
  position: number
}

export interface ColumnType {
  id: string
  title: string
  position: number
  cards: CardType[]
}

interface Props {
  initialColumns: ColumnType[]
  boardId: string
}

export default function KanbanBoard({ initialColumns, boardId }: Props) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null)
  const [newColTitle, setNewColTitle] = useState('')

  // Sürükleme Hassasiyeti Ayarları (Sensor Fix)
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 3 // 3 piksel hareket edince anında algılar
      } 
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        delay: 200, // Mobilde uzun basma süresi
        tolerance: 5 
      } 
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Card') setActiveCard(event.active.data.current.card)
    if (event.active.data.current?.type === 'Column') setActiveColumn(event.active.data.current.column)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    if (active.data.current?.type !== 'Card') return

    const isOverCard = over.data.current?.type === 'Card'
    const isOverColumn = over.data.current?.type === 'Column'

    setColumns(cols => {
      const newCols = cols.map(c => ({ ...c, cards: [...c.cards] }))
      const aColIdx = newCols.findIndex(c => c.cards.some(card => card.id === active.id))
      if (aColIdx === -1) return cols
      const aCardIdx = newCols[aColIdx].cards.findIndex(c => c.id === active.id)

      if (isOverCard) {
        const oColIdx = newCols.findIndex(c => c.cards.some(card => card.id === over.id))
        if (oColIdx === -1) return cols
        const oCardIdx = newCols[oColIdx].cards.findIndex(c => c.id === over.id)
        if (aColIdx === oColIdx) {
          newCols[aColIdx].cards = arrayMove(newCols[aColIdx].cards, aCardIdx, oCardIdx)
        } else {
          const [moved] = newCols[aColIdx].cards.splice(aCardIdx, 1)
          moved.column_id = newCols[oColIdx].id
          newCols[oColIdx].cards.splice(oCardIdx, 0, moved)
        }
      }

      if (isOverColumn) {
        const oColIdx = newCols.findIndex(c => c.id === over.id)
        if (oColIdx === -1 || aColIdx === oColIdx) return cols
        const [moved] = newCols[aColIdx].cards.splice(aCardIdx, 1)
        moved.column_id = newCols[oColIdx].id
        newCols[oColIdx].cards.push(moved)
      }

      return newCols
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)
    setActiveColumn(null)
    if (!over) return

    if (active.data.current?.type === 'Column') {
      const aIdx = columns.findIndex(c => c.id === active.id)
      const oIdx = columns.findIndex(c => c.id === over.id)
      if (aIdx !== oIdx) {
        const newCols = arrayMove(columns, aIdx, oIdx)
        setColumns(newCols)
        newCols.forEach((col, idx) => {
          supabase.from('columns').update({ position: idx + 1 }).eq('id', col.id).then()
        })
      }
      return
    }

    if (active.data.current?.type === 'Card') {
      columns.forEach((col) => {
        col.cards.forEach((card, idx) => {
          supabase.from('cards').update({ column_id: col.id, position: idx + 1 }).eq('id', card.id).then()
        })
      })
    }
  }

  const addColumn = async () => {
    if (!newColTitle.trim()) return
    const maxPos = columns.length > 0 ? Math.max(...columns.map(c => c.position)) : 0
    const { data } = await supabase
      .from('columns')
      .insert({ board_id: boardId, title: newColTitle.trim(), position: maxPos + 1 })
      .select().single()
    if (data) { setColumns([...columns, { ...data, cards: [] }]); setNewColTitle('') }
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver} 
      onDragEnd={handleDragEnd}
    >
      <div 
        className="flex gap-4 p-8 overflow-x-auto items-start bg-cyber-black" 
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map(column => (
            <ColumnContainer
              key={column.id}
              column={column}
              onColumnDelete={async () => {
                await supabase.from('columns').delete().eq('id', column.id)
                setColumns(cols => cols.filter(c => c.id !== column.id))
              }}
              onColumnRename={(title) => {
                setColumns(cols => cols.map(c => c.id === column.id ? { ...c, title } : c))
                supabase.from('columns').update({ title }).eq('id', column.id)
              }}
              onCardAdd={async (title) => {
                const maxPos = column.cards.length > 0 ? Math.max(...column.cards.map(c => c.position)) : 0
                const { data } = await supabase
                  .from('cards')
                  .insert({ column_id: column.id, title, position: maxPos + 1 })
                  .select().single()
                if (data) {
                  setColumns(cols => cols.map(c => c.id === column.id ? { ...c, cards: [...c.cards, data] } : c))
                }
              }}
              onCardUpdate={(cardId, updates) => {
                setColumns(cols => cols.map(c => ({
                  ...c,
                  cards: c.cards.map(card => card.id === cardId ? { ...card, ...updates } : card)
                })))
                supabase.from('cards').update(updates).eq('id', cardId)
              }}
              onCardDelete={(cardId) => {
                setColumns(cols => cols.map(c => ({
                  ...c,
                  cards: c.cards.filter(card => card.id !== cardId)
                })))
                supabase.from('cards').delete().eq('id', cardId)
              }}
            />
          ))}
        </SortableContext>

        {/* Add Section - Terminal Style */}
        <div className="flex-shrink-0 w-80">
          <div className="border border-cyber-border bg-cyber-dark p-6 shadow-[0_0_15px_rgba(15,240,252,0.1)]">
            <h3 className="text-cyber-neonPurple font-mono text-[10px] uppercase mb-4 tracking-[0.2em]">
              {">"} INITIALIZE_SECTION
            </h3>
            <input
              type="text"
              placeholder="SECTION_NAME..."
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addColumn()}
              className="w-full bg-black border border-cyber-border rounded-none p-2 mb-4 text-cyber-neonBlue font-mono text-sm focus:outline-none focus:border-cyber-neonBlue transition-colors"
            />
            <button
              onClick={addColumn}
              className="w-full text-[10px] font-mono font-bold uppercase border border-cyber-neonBlue text-cyber-neonBlue px-4 py-2 hover:bg-cyber-neonBlue hover:text-black transition-all shadow-[0_0_10px_rgba(15,240,252,0.3)]"
            >
              [ EXECUTE_ADD ]
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCard && <CardItem card={activeCard} isDragging />}
        {activeColumn && (
          <div className="bg-cyber-dark border border-cyber-neonPurple p-8 shadow-neon-purple w-72">
             <span className="text-[10px] font-mono font-bold uppercase text-cyber-neonPurple animate-pulse italic">
                RELOCATING_CORE_SECTION...
             </span>
             <h3 className="text-white font-mono font-bold text-2xl mt-2 tracking-tighter">
                {activeColumn.title}
             </h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
