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

  const dndStyle = { transform: CSS.Transform.toString(transform), transition }
  const gradient = GRADIENTS[parseInt(column.id.slice(-1), 16) % GRADIENTS.length]

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={{ ...dndStyle, width: '272px', minHeight: '120px', opacity: 0.4, border: '2px dashed rgba(192,132,252,0.3)', borderRadius: '16px', background: 'rgba(19,15,34,0.5)', flexShrink: 0 }} />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...dndStyle, width: '272px', maxHeight: 'calc(100vh - 80px)', background: '#130f22', border: '1px solid #2a1f45', borderRadius: '16px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ height: '2px', background: gradient, borderRadius: '16px 16px 0 0' }} />

      <div {...attributes} {...listeners} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'grab', userSelect: 'none' }}>
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
            style={{ flex: 1, background: '#06040f', border: '1px solid rgba(192,132,252,0.4)', borderRadius: '8px', padding: '4px 8px', fontSize: '13px', color: '#f1eeff', outline: 'none', marginRight: '8px' }}
          />
        ) : (
          <h3
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditingTitle(true) }}
            style={{ fontSize: '13px', fontWeight: 600, color: '#f1eeff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {column.title}
          </h3>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
          <span style={{ fontSize: '11px', color: '#4a3a6a', background: 'rgba(6,4,15,0.6)', border: '1px solid #2a1f45', padding: '2px 8px', borderRadius: '999px' }}>
            {column.cards.length}
          </span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => { if (confirm(`"${column.title}" sütununu sil?`)) onColumnDelete() }}
            style={{ background: 'none', border: 'none', color: '#4a3a6a', fontSize: '20px', lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}
          >×</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          <div style={{ border: '1px dashed rgba(42,31,69,0.5)', borderRadius: '12px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: '#4a3a6a' }}>Kart yok</span>
          </div>
        )}
      </div>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(42,31,69,0.6)' }}>
        {isAdding ? (
          <>
            <input
              autoFocus
              type="text"
              placeholder="Görev başlığı..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={async (e) => {
                // Enter basıldığında hemen UI'ı temizle ve veriyi gönder
                if (e.key === 'Enter' && newCardTitle.trim()) {
                  e.preventDefault();
                  const titleToAdd = newCardTitle.trim();
                  setNewCardTitle(''); 
                  setIsAdding(false);  
                  await onCardAdd(titleToAdd);
                }
                if (e.key === 'Escape') { 
                  setNewCardTitle(''); 
                  setIsAdding(false); 
                }
              }}
              style={{ width: '100%', background: '#06040f', border: '1px solid #2a1f45', borderRadius: '12px', padding: '10px 12px', fontSize: '14px', color: '#f1eeff', outline: 'none', marginBottom: '8px', display: 'block' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={async () => { if (newCardTitle.trim()) { const title = newCardTitle.trim(); setNewCardTitle(''); setIsAdding(false); await onCardAdd(title); } }}
                style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6)', color: '#06040f', border: 'none', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >Ekle</button>
              <button
                onClick={() => { setNewCardTitle(''); setIsAdding(false) }}
                style={{ background: 'transparent', color: '#9985c8', border: 'none', borderRadius: '12px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer' }}
              >İptal</button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#9985c8', fontSize: '14px', padding: '8px', borderRadius: '12px', cursor: 'pointer' }}
          >+ Kart Ekle</button>
        )}
      </div>
    </div>
  )
}
