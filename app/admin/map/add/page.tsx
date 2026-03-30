'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddMapPointPage() {
  const supabase = useMemo(() => createClient(), [])
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
    async function checkAdmin() {
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

      setIsAdmin(profile?.role === 'admin')
      setLoading(false)
    }

    checkAdmin()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')

    const { error } = await supabase.from('map_points').insert({
      title,
      description: description || null,
      lat: Number(lat),
      lng: Number(lng),
      type: type || null,
      is_public: isPublic,
    })

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Точка добавлена.')
    setTitle('')
    setDescription('')
    setLat('')
    setLng('')
    setType('')
    setIsPublic(true)
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Добавить точку</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Добавить точку на карту</h1>
        <p>Добавь новое место на карту айыла.</p>
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
            placeholder="Тип (school, shop, mosque...)"
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

          <button type="submit">Сохранить</button>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}