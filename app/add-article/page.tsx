'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AddArticlePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('draft')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
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

    loadProfile()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('Сначала войди в аккаунт.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('articles').insert({
      title,
      content,
      image_url: imageUrl || null,
      status,
      author_id: user.id,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Статья успешно добавлена.')
    setTitle('')
    setContent('')
    setImageUrl('')
    setStatus('draft')
    router.refresh()
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Добавление статьи</h1>
        <p className="status-error">У тебя нет доступа к этой странице.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Добавить статью</h1>
        <p>Заполни форму ниже, чтобы создать новую новость или публикацию для сайта айыла.</p>
      </section>

      <section className="card form-card">
        <div className="admin-toolbar">
          <Link href="/admin" className="button button-secondary">Назад в админку</Link>
          <Link href="/news" className="button button-secondary">Открыть новости</Link>
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
            placeholder="Текст статьи"
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

          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликовать</option>
          </select>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить статью'}
            </button>
          </div>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}