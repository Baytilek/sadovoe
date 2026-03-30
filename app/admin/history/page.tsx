'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type HistorySection = {
  id: number
  title: string
  sort_order: number
}

export default function AdminHistoryPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sections, setSections] = useState<HistorySection[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        setLoading(false)
        return
      }

      setIsAdmin(true)

      const { data, error } = await supabase
        .from('history_sections')
        .select('id, title, sort_order')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) setError(error.message)
      else setSections((data as HistorySection[]) ?? [])

      setLoading(false)
    }

    loadData()
  }, [supabase])

  async function handleDelete(id: number) {
    const ok = window.confirm('Удалить этот блок истории?')
    if (!ok) return

    const { error } = await supabase.from('history_sections').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setSections((prev) => prev.filter((item) => item.id !== id))
  }

  if (loading) return <section className="card">Загрузка...</section>

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">История айыла</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Управление историей</h1>
        <p>Здесь можно добавлять, редактировать и удалять блоки истории айыла.</p>
      </section>

      <section className="card">
        <div className="admin-toolbar">
          <Link href="/admin/history/add" className="button">Добавить блок</Link>
          <Link href="/admin" className="button button-secondary">Назад в админку</Link>
          <Link href="/history" className="button button-secondary">Открыть страницу истории</Link>
        </div>

        {error && <p className="status-error">{error}</p>}

        {sections.length === 0 ? (
          <p className="page-empty">Блоков истории пока нет.</p>
        ) : (
          <div className="grid">
            {sections.map((section) => (
              <div key={section.id} className="card">
                <h2 style={{ marginTop: 0 }}>{section.title}</h2>
                <p><strong>Порядок:</strong> {section.sort_order}</p>

                <div className="inline-actions">
                  <Link href={`/admin/history/edit/${section.id}`} className="button">
                    Редактировать
                  </Link>
                  <button onClick={() => handleDelete(section.id)} className="button button-secondary">
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}