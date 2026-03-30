'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Creator = {
  id: number
  full_name: string
  role_text: string
  sort_order: number
}

export default function AdminCreatorsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [creators, setCreators] = useState<Creator[]>([])
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
        .from('creators')
        .select('id, full_name, role_text, sort_order')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setCreators((data as Creator[]) ?? [])
      }

      setLoading(false)
    }

    loadData()
  }, [supabase])

  async function handleDelete(id: number) {
    const ok = window.confirm('Удалить этого создателя?')
    if (!ok) return

    const { error } = await supabase.from('creators').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setCreators((prev) => prev.filter((item) => item.id !== id))
  }

  if (loading) return <section className="card">Загрузка...</section>

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Управление создателями</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Управление создателями</h1>
        <p>Здесь можно добавлять, редактировать и удалять создателей сайта.</p>
      </section>

      <section className="card">
        <div className="admin-toolbar">
          <Link href="/admin/creators/add" className="button">Добавить создателя</Link>
          <Link href="/admin" className="button button-secondary">Назад в админку</Link>
          <Link href="/creators" className="button button-secondary">Открыть страницу</Link>
        </div>

        {error && <p className="status-error">{error}</p>}

        {creators.length === 0 ? (
          <p className="page-empty">Создателей пока нет.</p>
        ) : (
          <div className="grid">
            {creators.map((creator) => (
              <div key={creator.id} className="card">
                <h2 style={{ marginTop: 0 }}>{creator.full_name}</h2>
                <p><strong>Роль:</strong> {creator.role_text}</p>
                <p><strong>Порядок:</strong> {creator.sort_order}</p>

                <div className="inline-actions">
                  <Link href={`/admin/creators/edit/${creator.id}`} className="button">
                    Редактировать
                  </Link>
                  <button onClick={() => handleDelete(creator.id)} className="button button-secondary">
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