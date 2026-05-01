'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import KanbanBoard, { ColumnType } from '@/components/KanbanBoard'

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string
  const [boardTitle, setBoardTitle] = useState('')
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else fetchBoard()
    })
  }, [boardId])

  const fetchBoard = async () => {
    const { data: board } = await supabase.from('boards').select('title').eq('id', boardId).single()
    if (board) setBoardTitle(board.title)

    const { data: cols } = await supabase.from('columns').select('*').eq('board_id', boardId).order('position')
    if (!cols) { setLoading(false); return }

    const { data: cards } = await supabase
      .from('cards').select('*')
      .in('column_id', cols.map(c => c.id))
      .order('position')

    setColumns(cols.map(col => ({
      ...col,
      cards: (cards || []).filter(card => card.column_id === col.id)
    })))
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm transition-colors">
          ← Geri
        </Link>
        <h1 className="font-bold text-gray-800">{boardTitle}</h1>
      </header>
      <KanbanBoard initialColumns={columns} boardId={boardId} />
    </div>
  )
}
