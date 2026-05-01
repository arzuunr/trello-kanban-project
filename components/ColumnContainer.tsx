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

export default function ColumnContainer({ column, onCardAdd, onCardUpdate, onCardDelete, onColumnDelete, onColumnRename }: Props) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [columnTitle, setColumnTitle] = useState(column.title)

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: column.id, data: { type: 'Column', column } })

  const style = { transform: CSS.Transform.toString(transform), transition }

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="bg-gray-200 rounded-2xl w-72 min-h-48 opacity-40 border-2 border-blue-400 border-dashed flex-shrink-0" />
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-100 rounded-2xl w-72 flex-shrink-0 flex flex-col" style={{ maxHeight: 'calc(100vh - 100px)', ...style }}>
      {/* Header */}
      <div {...attributes} {...listeners} className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing select-none">
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
            className="font-semibold text-gray-700 bg-white rounded-lg px-2 py-1 text-sm w-full mr-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        ) : (
          <h3
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditingTitle(true) }}
            className="font-semibold text-gray-700 text-sm flex-1"
          >
            {column.title}
          </h3>
        )}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-xs bg-gray-300 text-gray-600 rounded-full px-2 py-0.5">{column.cards.length}</span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { if (confirm(`"${column.title}" sütununu ve tüm kartlarını silmek istediğinden emin misin?`)) onColumnDelete() }}
            className="text-gray-400 hover:text-red-500 text-xl leading-none transition-colors"
          >
            ×
          </button>
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
      </div>

      {/* Add Card */}
      <div className="p-3 border-t border-gray-200">
        {isAdding ? (
          <>
            <input
              autoFocus
              type="text"
              placeholder="Kart başlığı..."
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
              className="w-full border border-gray-200 rounded-xl p-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (newCardTitle.trim()) { await onCardAdd(newCardTitle.trim()); setNewCardTitle(''); setIsAdding(false) }
                }}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700"
              >
                Ekle
              </button>
              <button
                onClick={() => { setNewCardTitle(''); setIsAdding(false) }}
                className="text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 hover:bg-gray-200 rounded-xl transition-colors"
          >
            + Kart Ekle
          </button>
        )}
      </div>
    </div>
  )
}
