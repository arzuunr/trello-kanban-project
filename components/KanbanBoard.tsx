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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
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
  const { active, over } = event;
  setActiveCard(null);
  setActiveColumn(null);
  if (!over) return;

  // 1. Sütun Sıralamasını Kaydet
  if (active.data.current?.type === 'Column') {
    const aIdx = columns.findIndex(c => c.id === active.id);
    const oIdx = columns.findIndex(c => c.id === over.id);
    if (aIdx !== oIdx) {
      const newCols = arrayMove(columns, aIdx, oIdx);
      setColumns(newCols);
      // Veritabanında tüm sütun pozisyonlarını güncelle
      newCols.forEach((col, idx) => {
        supabase.from('columns').update({ position: idx + 1 }).eq('id', col.id).then();
      });
    }
    return;
  }

  // 2. Kart Sıralamasını ve Sütununu Kaydet
  if (active.data.current?.type === 'Card') {
    // Sürükleme bittiğinde tüm sütunlardaki tüm kartların pozisyonlarını veritabanına yazıyoruz
    columns.forEach((col) => {
      col.cards.forEach((card, idx) => {
        // Kartın hem hangi sütunda olduğunu hem de o sütundaki sırasını kaydediyoruz
        supabase
          .from('cards')
          .update({ 
            column_id: col.id, // Kartın içinde bulunduğu güncel sütun
            position: idx + 1  // Kartın o sütundaki güncel sırası
          })
          .eq('id', card.id)
          .then();
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
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 overflow-x-auto items-start" style={{ minHeight: 'calc(100vh - 60px)' }}>
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

        {/* Add Column */}
        <div className="flex-shrink-0 w-72">
          <div className="bg-gray-100 rounded-2xl p-3">
            <input
              type="text"
              placeholder="Yeni sütun adı..."
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addColumn()}
              className="w-full border border-gray-200 rounded-xl p-2 mb-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button
              onClick={addColumn}
              className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700"
            >
              + Sütun Ekle
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCard && <CardItem card={activeCard} isDragging />}
        {activeColumn && <div className="bg-gray-300 rounded-2xl w-72 h-32 opacity-80 rotate-2 shadow-2xl" />}
      </DragOverlay>
    </DndContext>
  )
}
