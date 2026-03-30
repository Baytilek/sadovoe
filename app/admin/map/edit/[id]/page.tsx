'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditMapPointPage() {
  const supabase = useMemo(() => createClient(), [])
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [type, setType] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
        .select('title, description, lat, lng, type, is_public')
        .eq('id', Number(params.id))
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setTitle(data.title ?? '')
        setDescription(data.description ?? '')
        setLat(String(data.lat ?? ''))
        setLng(String(data.lng ?? ''))
        setType(data.type ?? '')
        setIsPublic(data.is_public ?? true)
      }

      setLoading(false)
    }

    loadData()
  }, [params.id, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')

    const { error } = await supabase
      .from('map_points')
      .update({
        title,
        description: description || null,
        lat: Number(lat),
        lng: Number(lng),
        type: type || null,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(params.id))

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Точка обновлена.')
    router.push('/admin/map')
    router.refresh()
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Редактировать точку</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Редактировать точку карты</h1>
        <p>Измени координаты, описание и публичность точки.</p>
      </section>

      <section className="card form-card">
        <div className="admin-toolbar">
          <Link href="/admin/map" className="button button-secondary">Назад</Link>
          <Link href="/map" className="button button-secondary">Открыть карту</Link>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            className="input"
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="textarea"
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />

          <input
            className="input"
            type="text"
            placeholder="Широта (lat)"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Долгота (lng)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Тип"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Показывать на публичной карте
          </label>

          <button type="submit">Сохранить изменения</button>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}