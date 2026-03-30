'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddHistoryPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
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

    const { error } = await supabase.from('history_sections').insert({
      title,
      content,
      image_url: imageUrl || null,
      sort_order: Number(sortOrder),
    })

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Блок истории добавлен.')
    setTitle('')
    setContent('')
    setImageUrl('')
    setSortOrder(0)
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Добавить блок истории</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Добавить блок истории</h1>
        <p>Создай новый раздел для страницы истории айыла.</p>
      </section>

      <section className="card form-card">
        <div className="admin-toolbar">
          <Link href="/admin/history" className="button button-secondary">Назад</Link>
          <Link href="/history" className="button button-secondary">Открыть историю</Link>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            className="input"
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="textarea"
            placeholder="Текст"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
          />

          <input
            className="input"
            type="text"
            placeholder="Ссылка на изображение"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <input
            className="input"
            type="number"
            placeholder="Порядок"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />

          <button type="submit">Сохранить</button>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}