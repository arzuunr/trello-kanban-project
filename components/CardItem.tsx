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

  if (isSortableDragging) {
    return <div ref={setNodeRef} style={style} className="bg-blue-100 rounded-xl border-2 border-blue-400 border-dashed min-h-16 opacity-50" />
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-md border border-blue-300">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Kart başlığı"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama (opsiyonel)..."
          className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-3 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          rows={3}
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onUpdate?.({ title: title.trim() || card.title, description }); setIsEditing(false) }}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700"
          >
            Kaydet
          </button>
          <button
            onClick={() => { setTitle(card.title); setDescription(card.description || ''); setIsEditing(false) }}
            className="text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            İptal
          </button>
          <button
            onClick={() => { if (confirm('Kartı sil?')) onDelete?.() }}
            className="ml-auto text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Sil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={() => setIsEditing(true)}
      className={`bg-white rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all border border-transparent hover:border-blue-200 group ${isDragging ? 'rotate-2 shadow-xl scale-105' : ''}`}
    >
      <p className="text-sm font-medium text-gray-800 leading-snug">{card.title}</p>
      {card.description && (
        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{card.description}</p>
      )}
      <p className="text-xs text-gray-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        ✏️ Düzenlemek için çift tıkla
      </p>
    </div>
  )
}
