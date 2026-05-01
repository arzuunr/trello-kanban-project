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

  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition, 
    isDragging: isSortableDragging 
  } = useSortable({ id: card.id, data: { type: 'Card', card } })

  // Sürükleme sorununu çözen kritik stil ayarı
  const style = {
    // CSS.Transform yerine CSS.Translate kullanımı bazen daha akıcıdır
    transform: CSS.Translate.toString(transform),
    transition,
    // Sürüklenen kartın diğerlerinin altında kalmaması için z-index
    zIndex: isDragging ? 999 : 1,
    // Mobil ve tarayıcı sürükleme çakışmasını önler
    touchAction: 'none'
  }

  // Sürükleme sırasındaki boşluk (Neon Hayalet Görünüm)
  if (isSortableDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-black/40 border border-dashed border-cyber-neonPurple/50 min-h-[120px] rounded-sm" 
      />
    )
  }

  // Düzenleme Modu (Futuristic Terminal Form)
  if (isEditing) {
    return (
      <div className="bg-cyber-dark border border-cyber-neonPurple p-4 shadow-neon-purple relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-neonPurple animate-pulse" />
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-black border-b border-cyber-border py-2 text-sm font-mono text-cyber-neonPurple mb-2 focus:outline-none focus:border-cyber-neonBlue"
          placeholder=">_ TASK_NAME"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-black border-none text-xs font-mono text-gray-400 mb-4 resize-none focus:outline-none"
          rows={3}
          placeholder="// DATA_DESCRIPTION..."
        />
        <div className="flex justify-between items-center pt-2 border-t border-cyber-border">
           <div className="flex gap-4">
            <button
              onClick={() => { onUpdate?.({ title: title.trim() || card.title, description }); setIsEditing(false) }}
              className="text-[10px] font-bold font-mono text-cyber-neonBlue border border-cyber-neonBlue px-2 py-1 hover:bg-cyber-neonBlue hover:text-black transition-all"
            >
              [ SAVE_DATA ]
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-mono text-gray-500 hover:text-white"
            >
              CANCEL
            </button>
          </div>
          <button
            onClick={() => { if (confirm('PURGE_DATA: Confirm?')) onDelete?.() }}
            className="text-[10px] font-mono text-cyber-neonRed hover:underline"
          >
            DELETE_FILE
          </button>
        </div>
      </div>
    )
  }

  // CardItem.tsx içindeki Normal Görünüm return'ü:
return (
  <div ref={setNodeRef} style={style} {...attributes} {...listeners}
    onDoubleClick={() => setIsEditing(true)}
    className={`bg-cyber-surface p-5 border border-cyber-border hover:border-cyber-neonBlue transition-all cursor-grab active:cursor-grabbing group
    ${isDragging ? 'shadow-neon-blue border-cyber-neonBlue opacity-90 scale-105' : ''}`}
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-1.5 bg-cyber-neonPurple group-hover:bg-cyber-neonBlue transition-colors" />
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Entry_{card.id.slice(0,4)}</span>
    </div>

    {/* Okunabilir başlık ve metin */}
    <h4 className="text-lg font-bold text-white group-hover:text-cyber-neonBlue transition-colors leading-tight mb-3">
      {card.title}
    </h4>
    
    {card.description && (
      <p className="text-xs text-gray-400 font-mono leading-relaxed mb-4 line-clamp-3">
        {card.description}
      </p>
    )}

    <div className="flex justify-between items-center pt-3 border-t border-cyber-border opacity-50 group-hover:opacity-100 transition-opacity">
      <span className="text-[9px] font-mono text-cyber-neonPurple tracking-tighter uppercase font-bold tracking-widest">Access_Log_04</span>
      <span className="text-[9px] font-mono text-white animate-pulse">EDIT_DATA {">"}</span>
    </div>
  </div>
)
}
