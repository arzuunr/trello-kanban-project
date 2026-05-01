'use client'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CardType } from './KanbanBoard'

interface Props {
  card: CardType
  isDragging?: boolean
  onUpdate?: (updates: Partial<CardType>) => void
  onDelete?: () => void
}

export default function CardItem({ card, isDragging = false, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')

  const { setNodeRef, attributes, listeners, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: card.id, data: { type: 'Card', card } })

  const style = { transform: CSS.Transform.toString(transform), transition }

  // Sürükleme sırasındaki boşluk (Placeholder)
  if (isSortableDragging) {
    return <div ref={setNodeRef} style={style} className="bg-gray-50 rounded-none border border-dashed border-gray-200 min-h-[100px] opacity-40" />
  }

  // Düzenleme Modu (Minimal Form)
  if (isEditing) {
    return (
      <div className="bg-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b border-gray-100 py-2 text-sm font-serif italic mb-2 focus:outline-none focus:border-black"
          placeholder="Entry Title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border-none text-xs font-sans text-gray-600 mb-4 resize-none focus:outline-none"
          rows={3}
          placeholder="Add observations..."
        />
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
           <div className="flex gap-4">
            <button
              onClick={() => { onUpdate?.({ title: title.trim() || card.title, description }); setIsEditing(false) }}
              className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-black"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black"
            >
              Cancel
            </button>
          </div>
          <button
            onClick={() => { if (confirm('Discard this entry?')) onDelete?.() }}
            className="text-[10px] font-bold uppercase tracking-widest text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  // Normal Görünüm (Academic Card)
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={() => setIsEditing(true)}
      className={`bg-white p-5 border border-gray-100 hover:border-black transition-all cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-none ${isDragging ? 'z-50 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : ''}`}
    >
      <h4 className="text-sm font-serif font-bold leading-tight mb-2 group-hover:italic transition-all">
        {card.title}
      </h4>
      
      {card.description && (
        <p className="text-xs text-gray-500 font-sans leading-relaxed line-clamp-3 mb-3">
          {card.description}
        </p>
      )}

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] uppercase tracking-tighter text-gray-300 font-bold">
          Ref: {card.id.slice(0, 5)}
        </span>
        <span className="text-[9px] uppercase tracking-widest text-black font-bold">
          Edit Entry →
        </span>
      </div>
    </div>
  )
}
