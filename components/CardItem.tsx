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
    return <div ref={setNodeRef} style={style}
      className="rounded-xl min-h-16 border border-dashed border-accent/40 bg-accent/5 opacity-60" />
  }

  if (isEditing) {
    return (
      <div className="bg-void border border-accent/40 rounded-xl p-3"
        style={{ boxShadow: '0 0 20px rgba(192,132,252,0.1)' }}>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-textMain focus:outline-none focus:border-accent transition-colors mb-2"
          placeholder="Görev başlığı" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama..."
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-textDim focus:outline-none focus:border-accent transition-colors resize-none mb-3" rows={3} />
        <div className="flex gap-2 items-center">
          <button onClick={() => { onUpdate?.({ title: title.trim() || card.title, description }); setIsEditing(false) }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', color: '#06040f' }}>
            Kaydet
          </button>
          <button onClick={() => { setTitle(card.title); setDescription(card.description || ''); setIsEditing(false) }}
            className="text-xs text-textDim px-3 py-1.5 rounded-lg hover:bg-surface transition-colors">İptal</button>
          <button onClick={() => { if (confirm('Kartı sil?')) onDelete?.() }}
            className="ml-auto text-xs text-red-500/50 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-red-950/20 transition-colors">Sil</button>
        </div>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onDoubleClick={() => setIsEditing(true)}
      className={`group bg-surface border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:border-accent/40
        ${isDragging ? 'rotate-2 scale-105 border-accent/60' : ''}`}
      style={isDragging ? { boxShadow: '0 10px 40px rgba(192,132,252,0.3)' } : undefined}>
      <p className="text-sm font-medium text-textMain group-hover:text-accent transition-colors leading-snug">
        {card.title}
      </p>
      {card.description && (
        <p className="text-xs text-textDim mt-1.5 line-clamp-2 leading-relaxed">{card.description}</p>
      )}
      <p className="text-xs text-muted mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        çift tıkla düzenle
      </p>
    </div>
  )
}
