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
    return <div ref={setNodeRef} style={style} className="bg-academic-gray border border-dashed border-gray-300 rounded-none w-72 min-h-[500px] opacity-40 flex-shrink-0" />
  }

  return (
    <div 
      ref={setNodeRef} 
      className="bg-transparent w-72 flex-shrink-0 flex flex-col border-r border-gray-100 px-2" 
      style={{ maxHeight: 'calc(100vh - 120px)', ...style }}
    >
      {/* Header - Teknik ve Minimal */}
      <div {...attributes} {...listeners} className="flex items-center justify-between p-4 cursor-grab active:cursor-grabbing select-none group">
        {isEditingTitle ? (
          <input
            autoFocus
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            onBlur={() => { onColumnRename(columnTitle.trim() || column.title); setIsEditingTitle(false) }}
            className="font-serif italic text-lg bg-white border-b border-black px-1 w-full focus:outline-none"
          />
        ) : (
          <div className="flex flex-col">
             <span className="text-[9px] uppercase tracking-[0.3em] text-gray-300 font-bold mb-1">Section</span>
             <h3
                onDoubleClick={(e) => { e.stopPropagation(); setIsEditingTitle(true) }}
                className="font-serif font-bold text-xl text-black group-hover:italic transition-all"
              >
                {column.title}
              </h3>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-gray-400">[{column.cards.length}]</span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { if (confirm(`Delete section "${column.title}"?`)) onColumnDelete() }}
            className="text-gray-300 hover:text-black transition-colors text-xl"
          >
            ×
          </button>
        </div>
      </div>

      {/* Cards Area - Daha havadar */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-4 scrollbar-hide">
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

      {/* Add Entry - Metin Odaklı */}
      <div className="p-4 mt-auto">
        {isAdding ? (
          <div className="bg-white border border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <input
              autoFocus
              type="text"
              placeholder="Entry Title..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="w-full text-sm font-serif italic border-b border-gray-100 pb-1 mb-3 focus:outline-none focus:border-black"
            />
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  if (newCardTitle.trim()) { await onCardAdd(newCardTitle.trim()); setNewCardTitle(''); setIsAdding(false) }
                }}
                className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-black"
              >
                Add
              </button>
              <button
                onClick={() => { setNewCardTitle(''); setIsAdding(false) }}
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full text-left text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all border-t border-gray-100 pt-4"
          >
            + New Entry
          </button>
        )}
      </div>
    </div>
  )
}
