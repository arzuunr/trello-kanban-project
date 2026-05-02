'use client'
import { useState } from 'react'
import { 
  DndContext, DragOverlay, PointerSensor, TouchSensor, 
  useSensor, useSensors, DragStartEvent, DragEndEvent, DragOverEvent, 
  closestCorners 
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { supabase } from '@/lib/supabase'
import ColumnContainer from './ColumnContainer'
import CardItem from './CardItem'

export interface CardType { id: string; column_id: string; title: string; description: string | null; position: number }
export interface ColumnType { id: string; title: string; position: number; cards: CardType[] }

export default function KanbanBoard({ initialColumns, boardId }: { initialColumns: ColumnType[], boardId: string }) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns)
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null)
  const [newColTitle, setNewColTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 0.1 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  )

  const handleDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === 'Card') setActiveCard(e.active.data.current.card)
    if (e.active.data.current?.type === 'Column') setActiveColumn(e.active.data.current.column)
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id || active.data.current?.type !== 'Card') return

    const activeId = active.id
    const overId = over.id

    setColumns(prev => {
      const newCols = prev.map(c => ({ ...c, cards: [...c.cards] }))
      
      const aColIdx = newCols.findIndex(c => c.cards.some(card => card.id === activeId))
      const oColIdx = newCols.findIndex(c => c.id === overId || c.cards.some(card => card.id === overId))

      if (aColIdx === -1 || oColIdx === -1) return prev

      const aCardIdx = newCols[aColIdx].cards.findIndex(c => c.id === activeId)

      // AYNI SÜTUN İÇİNDE YER DEĞİŞTİRME
      if (aColIdx === oColIdx) {
        const oCardIdx = newCols[oColIdx].cards.findIndex(c => c.id === overId)
        newCols[aColIdx].cards = arrayMove(newCols[aColIdx].cards, aCardIdx, oCardIdx)
      } 
      // SÜTUNLAR ARASI GEÇİŞ
      else {
        const [movedCard] = newCols[aColIdx].cards.splice(aCardIdx, 1)
        movedCard.column_id = newCols[oColIdx].id
        
        const oCardIdx = newCols[oColIdx].cards.findIndex(c => c.id === overId)
        const insertIdx = oCardIdx >= 0 ? oCardIdx : newCols[oColIdx].cards.length
        newCols[oColIdx].cards.splice(insertIdx, 0, movedCard)
      }

      return newCols
    })
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    setActiveCard(null); setActiveColumn(null)
    if (!over) return

    // Sütun Sıralama
    if (active.data.current?.type === 'Column' && active.id !== over.id) {
      const oldIdx = columns.findIndex(c => c.id === active.id)
      const newIdx = columns.findIndex(c => c.id === over.id)
      const newCols = arrayMove(columns, oldIdx, newIdx)
      setColumns(newCols)
      newCols.forEach((col, idx) => {
        supabase.from('columns').update({ position: idx }).eq('id', col.id).then()
      })
    }

    // Kart Sıralama Senkronizasyonu
    if (active.data.current?.type === 'Card') {
      columns.forEach(col => {
        col.cards.forEach((card, idx) => {
          supabase.from('cards').update({ 
            column_id: col.id, 
            position: idx 
          }).eq('id', card.id).then()
        })
      })
    }
  }

  const addColumn = async () => {
    if (!newColTitle.trim()) return
    const { data } = await supabase.from('columns').insert({ 
      board_id: boardId, 
      title: newColTitle.trim(), 
      position: columns.length 
    }).select().single()
    if (data) setColumns([...columns, { ...data, cards: [] }]); setNewColTitle('')
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver} 
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: '20px', padding: '40px', overflowX: 'auto', alignItems: 'flex-start', background: '#06040f', minHeight: 'calc(100vh - 73px)' }}>
        <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map(col => (
            <ColumnContainer 
              key={col.id} 
              column={col} 
              onColumnDelete={async () => { await supabase.from('columns').delete().eq('id', col.id); setColumns(c => c.filter(x => x.id !== col.id)) }} 
              onColumnRename={(title) => { setColumns(c => c.map(x => x.id === col.id ? {...x, title} : x)); supabase.from('columns').update({ title }).eq('id', col.id) }} 
              onCardAdd={async (t) => { const {data} = await supabase.from('cards').insert({column_id: col.id, title: t, position: col.cards.length}).select().single(); if(data) setColumns(c => c.map(x => x.id === col.id ? {...x, cards: [...x.cards, data]} : x)) }} 
              onCardUpdate={(id, up) => { setColumns(c => c.map(x => ({...x, cards: x.cards.map(ca => ca.id === id ? {...ca, ...up} : ca)}))); supabase.from('cards').update(up).eq('id', id) }} 
              onCardDelete={(id) => { setColumns(c => c.map(x => ({...x, cards: x.cards.filter(ca => ca.id !== id)}))); supabase.from('cards').delete().eq('id', id) }} 
            />
          ))}
        </SortableContext>

        <div style={{ flexShrink: 0, width: '272px' }}>
          <div style={{ background: 'rgba(19, 15, 34, 0.4)', border: '2px dashed #2a1f45', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '140px' }}>
            <span style={{ color: '#c084fc', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
              [ YENİ SÜTUN TANIMLA ]
            </span>
            <input value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} placeholder="Sütun Adı..." style={{ width: '100%', background: '#06040f', border: '1px solid #2a1f45', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', fontSize: '13px' }} />
            <button onClick={addColumn} style={{ width: '100%', background: 'linear-gradient(135deg, #c084fc, #f472b6)', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: 'bold', cursor: 'pointer', color: '#06040f' }}>+ Sütun Ekle</button>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeCard && <CardItem card={activeCard} isDragging />}
        {activeColumn && (
          <div style={{ background: '#130f22', border: '2px solid #c084fc', borderRadius: '16px', padding: '20px', width: '272px', opacity: 0.8 }}>
            <h3 style={{ color: 'white', fontWeight: 700 }}>{activeColumn.title}</h3>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
