'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type MapPoint = {
  id: number
  title: string
  description: string | null
  lat: number
  lng: number
  type: string | null
  is_public: boolean
}

export default function AdminMapPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [points, setPoints] = useState<MapPoint[]>([])
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
        .from('map_points')
        .select('id, title, description, lat, lng, type, is_public')
        .order('created_at', { ascending: true })

      if (error) setError(error.message)
      else setPoints((data as MapPoint[]) ?? [])

      setLoading(false)
    }

    loadData()
  }, [supabase])

  async function handleDelete(id: number) {
    const ok = window.confirm('Удалить эту точку?')
    if (!ok) return

    const { error } = await supabase.from('map_points').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setPoints((prev) => prev.filter((item) => item.id !== id))
  }

  async function handleTogglePublic(id: number, currentValue: boolean) {
    const { error } = await supabase
      .from('map_points')
      .update({
        is_public: !currentValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setPoints((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_public: !currentValue } : item
      )
    )
  }

  if (loading) return <section className="card">Загрузка...</section>

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Управление картой</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Управление точками карты</h1>
        <p>Здесь можно добавлять важные места, менять их описание и скрывать с публичной карты.</p>
      </section>

      <section className="card">
        <div className="admin-toolbar">
          <Link href="/admin/map/add" className="button">Добавить точку</Link>
          <Link href="/admin" className="button button-secondary">Назад в админку</Link>
          <Link href="/map" className="button button-secondary">Открыть карту</Link>
        </div>

        {error && <p className="status-error">{error}</p>}

        {points.length === 0 ? (
          <p className="page-empty">Точек пока нет.</p>
        ) : (
          <div className="grid">
            {points.map((point) => (
              <div key={point.id} className="card">
                <h2 style={{ marginTop: 0 }}>{point.title}</h2>
                <p><strong>Тип:</strong> {point.type || '—'}</p>
                <p><strong>Широта:</strong> {point.lat}</p>
                <p><strong>Долгота:</strong> {point.lng}</p>
                <p><strong>Публично:</strong> {point.is_public ? 'Да' : 'Нет'}</p>

                {point.description && (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{point.description}</p>
                )}

                <div className="inline-actions">
                  <Link href={`/admin/map/edit/${point.id}`} className="button">
                    Редактировать
                  </Link>

                  <button
                    onClick={() => handleTogglePublic(point.id, point.is_public)}
                    className="button button-secondary"
                  >
                    {point.is_public ? 'Скрыть' : 'Сделать публичной'}
                  </button>

                  <button
                    onClick={() => handleDelete(point.id)}
                    className="button button-secondary"
                  >
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