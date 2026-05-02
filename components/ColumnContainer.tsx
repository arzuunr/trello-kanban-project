'use client'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import CardItem from './CardItem'
import { ColumnType, CardType } from './KanbanBoard'

interface Props {
  column: ColumnType
  onCardAdd: (title: string) => Promise<void>
  onCardUpdate: (cardId: string, updates: Partial<CardType>) => void
  onCardDelete: (cardId: string) => void
  onColumnDelete: () => Promise<void>
  onColumnRename: (title: string) => void
}

const GRADIENTS = [
  'linear-gradient(135deg, #c084fc, #818cf8)',
  'linear-gradient(135deg, #f472b6, #c084fc)',
  'linear-gradient(135deg, #818cf8, #38bdf8)',
  'linear-gradient(135deg, #34d399, #818cf8)',
  'linear-gradient(135deg, #fb923c, #f472b6)',
]

export default function ColumnContainer({ column, onCardAdd, onCardUpdate, onCardDelete, onColumnDelete, onColumnRename }: Props) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [columnTitle, setColumnTitle] = useState(column.title)

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: column.id, data: { type: 'Column', column } })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const gradient = GRADIENTS[parseInt(column.id.slice(-1), 16) % GRADIENTS.length]

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, width: '272px' }}
        className="bg-panel/50 border border-dashed border-accent/30 rounded-2xl min-h-32 opacity-40 flex-shrink-0"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, width: '272px', maxHeight: 'calc(100vh - 80px)' }}
      className="bg-panel/80 backdrop-blur border border-border rounded-2xl flex-shrink-0 flex flex-col"
    >
      {/* Top gradient bar */}
      <div className="h-0.5 rounded-t-2xl w-full" style={{ background: gradient }} />

      {/* Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing select-none"
      >
        {isEditingTitle ? (
          <input
            autoFocus
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            onBlur={() => { onColumnRename(columnTitle.trim() || column.title); setIsEditingTitle(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onColumnRename(columnTitle.trim() || column.title); setIsEditingTitle(false) }
              if (e.key === 'Escape') { setColumnTitle(column.title); setIsEditingTitle(false) }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="bg-void border border-accent/40 rounded-lg px-2 py-1 text-sm text-textMain w-full mr-2 focus:outline-none"
          />
        ) : (
          <h3
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditingTitle(true) }}
            className="text-sm font-semibold text-textMain flex-1 truncate"
          >
            {column.title}
          </h3>
        )}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-muted bg-void/60 border border-border px-2 py-0.5 rounded-full">
            {column.cards.length}
          </span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { if (confirm(`"${column.title}" sütununu sil?`)) onColumnDelete() }}
            className="text-muted hover:text-red-400 text-xl leading-none transition-colors"
          >×</button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-2">
        <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {column.cards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onUpdate={(updates) => onCardUpdate(card.id, updates)}
              onDelete={() => onCardDelete(card.id)}
            />
          ))}
        </SortableContext>
        {column.cards.length === 0 && !isAdding && (
          <div className="border border-dashed border-border/50 rounded-xl h-16 flex items-center justify-center">
            <span className="text-xs text-muted">Kart yok</span>
          </div>
        )}
      </div>

      {/* Add card */}
      <div className="p-3 border-t border-border/60">
        {isAdding ? (
          <>
            <input
              autoFocus
              type="text"
              placeholder="Görev başlığı..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && newCardTitle.trim()) {
                  await onCardAdd(newCardTitle.trim())
                  setNewCardTitle('')
                  setIsAdding(false)
                }
                if (e.key === 'Escape') { setNewCardTitle(''); setIsAdding(false) }
              }}
              className="w-full bg-void border border-border rounded-xl px-3 py-2.5 text-sm text-textMain placeholder-muted focus:outline-none focus:border-accent transition-colors mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (newCardTitle.trim()) {
                    await onCardAdd(newCardTitle.trim())
                    setNewCardTitle('')
                    setIsAdding(false)
                  }
                }}
                className="text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', color: '#06040f' }}
              >
                Ekle
              </button>
              <button
                onClick={() => { setNewCardTitle(''); setIsAdding(false) }}
                className="text-xs text-textDim px-3 py-2 rounded-xl hover:bg-void transition-colors"
              >
                İptal
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-sm text-textDim hover:text-accent py-2 rounded-xl hover:bg-void/60 transition-colors"
          >
            + Kart Ekle
          </button>
        )}
      </div>
    </div>
  )
}
