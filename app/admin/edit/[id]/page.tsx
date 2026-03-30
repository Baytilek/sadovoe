'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditArticlePage() {
  const supabase = useMemo(() => createClient(), [])
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadData() {
      setError('')

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

      const articleId = Number(params.id)

      const { data, error } = await supabase
        .from('articles')
        .select('id, title, content, image_url, status')
        .eq('id', articleId)
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setTitle(data.title ?? '')
        setContent(data.content ?? '')
        setImageUrl(data.image_url ?? '')
        setStatus((data.status as 'draft' | 'published') ?? 'draft')
      }

      setLoading(false)
    }

    loadData()
  }, [params.id, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const articleId = Number(params.id)

    const { error } = await supabase
      .from('articles')
      .update({
        title,
        content,
        image_url: imageUrl || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Статья обновлена.')
    router.push('/admin')
    router.refresh()
  }

  if (loading) {
    return <main style={{ padding: 20 }}>Загрузка...</main>
  }

  if (!isAdmin) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Редактирование статьи</h1>
        <p>Доступ запрещен.</p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 700, margin: '40px auto', padding: 20 }}>
      <h1>Редактировать статью</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 20 }}>
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: 10 }}
        />

        <textarea
          placeholder="Текст статьи"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          style={{ padding: 10 }}
        />

        <input
          type="text"
          placeholder="Ссылка на изображение"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={{ padding: 10 }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          style={{ padding: 10 }}
        >
          <option value="draft">Черновик</option>
          <option value="published">Опубликовать</option>
        </select>

        <button type="submit" disabled={saving} style={{ padding: 10 }}>
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: 12 }}>{error}</p>}
      {message && <p style={{ color: 'green', marginTop: 12 }}>{message}</p>}
    </main>
  )
}