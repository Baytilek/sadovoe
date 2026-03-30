'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditHistoryPage() {
  const supabase = useMemo(() => createClient(), [])
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
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
        .from('history_sections')
        .select('title, content, image_url, sort_order')
        .eq('id', Number(params.id))
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setTitle(data.title ?? '')
        setContent(data.content ?? '')
        setImageUrl(data.image_url ?? '')
        setSortOrder(data.sort_order ?? 0)
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
      .from('history_sections')
      .update({
        title,
        content,
        image_url: imageUrl || null,
        sort_order: Number(sortOrder),
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(params.id))

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Блок истории обновлен.')
    router.push('/admin/history')
    router.refresh()
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Редактировать историю</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Редактировать блок истории</h1>
        <p>Измени текст, картинку и порядок отображения блока истории.</p>
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

          <button type="submit">Сохранить изменения</button>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}