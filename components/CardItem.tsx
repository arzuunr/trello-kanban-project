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

  const dndStyle = { transform: CSS.Transform.toString(transform), transition }

  if (isSortableDragging) {
    return (
      <div ref={setNodeRef} style={dndStyle}
        className="rounded-xl min-h-16 border border-dashed opacity-60"
        style={{ borderColor: 'rgba(192,132,252,0.4)', background: 'rgba(192,132,252,0.05)' }}
      />
    )
  }

  if (isEditing) {
    return (
      <div style={{ background: '#06040f', border: '1px solid rgba(192,132,252,0.4)', borderRadius: '12px', padding: '12px', boxShadow: '0 0 20px rgba(192,132,252,0.1)' }}>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', background: '#0e0a1a', border: '1px solid #2a1f45', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', color: '#f1eeff', outline: 'none', marginBottom: '8px', display: 'block' }}
          placeholder="Görev başlığı"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Açıklama..."
          style={{ width: '100%', background: '#0e0a1a', border: '1px solid #2a1f45', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#9985c8', outline: 'none', resize: 'none', marginBottom: '12px', display: 'block' }}
          rows={3}
        />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => { onUpdate?.({ title: title.trim() || card.title, description }); setIsEditing(false) }}
            style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', color: '#06040f', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >Kaydet</button>
          <button
            onClick={() => { setTitle(card.title); setDescription(card.description || ''); setIsEditing(false) }}
            style={{ background: 'transparent', color: '#9985c8', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
          >İptal</button>
          <button
            onClick={() => { if (confirm('Kartı sil?')) onDelete?.() }}
            style={{ marginLeft: 'auto', background: 'transparent', color: 'rgba(239,68,68,0.5)', border: 'none', borderRadius: '8px', padding: '6px 8px', fontSize: '12px', cursor: 'pointer' }}
          >Sil</button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dndStyle,
        background: '#0e0a1a',
        border: isDragging ? '1px solid rgba(192,132,252,0.6)' : '1px solid #2a1f45',
        borderRadius: '12px',
        padding: '12px',
        cursor: 'grab',
        boxShadow: isDragging ? '0 10px 40px rgba(192,132,252,0.3)' : 'none',
        transform: isDragging ? `${CSS.Transform.toString(transform)} rotate(2deg) scale(1.05)` : CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      onDoubleClick={() => setIsEditing(true)}
    >
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#f1eeff', lineHeight: 1.4 }}>
        {card.title}
      </p>
      {card.description && (
        <p style={{ fontSize: '12px', color: '#9985c8', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {card.description}
        </p>
      )}
      <p style={{ fontSize: '11px', color: '#4a3a6a', marginTop: '8px' }}>çift tıkla düzenle</p>
    </div>
  )
}
