'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type CommentItem = {
  id: number
  user_id: string
  author_name: string
  content: string
  created_at: string
}

type Props = {
  articleId: number
}

export default function ArticleComments({ articleId }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [userId, setUserId] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('user')

  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  async function loadComments() {
    const { data, error } = await supabase
      .from('article_comments')
      .select('id, user_id, author_name, content, created_at')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
      return
    }

    setComments((data as CommentItem[]) ?? [])
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()

        setFullName(profile?.full_name || 'Пользователь')
        setRole(profile?.role || 'user')
      } else {
        setUserId('')
        setFullName('')
        setRole('user')
      }

      await loadComments()
      setLoading(false)
    }

    loadData()
  }, [articleId, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!userId) {
      setError('Сначала войди в аккаунт.')
      setSaving(false)
      return
    }

    const text = content.trim()

    if (!text) {
      setError('Комментарий не должен быть пустым.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('article_comments').insert({
      article_id: articleId,
      user_id: userId,
      author_name: fullName || 'Пользователь',
      content: text,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setContent('')
    await loadComments()
  }

  async function handleDelete(commentId: number) {
    const ok = window.confirm('Удалить комментарий?')
    if (!ok) return

    const { error } = await supabase
      .from('article_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      setError(error.message)
      return
    }

    setComments((prev) => prev.filter((item) => item.id !== commentId))
  }

  return (
    <section className="comments-box">
      <h3 style={{ marginTop: 0 }}>Комментарии</h3>

      {loading ? (
        <p className="page-empty">Загрузка комментариев...</p>
      ) : comments.length === 0 ? (
        <p className="page-empty">Комментариев пока нет.</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div>
                  <strong>{comment.author_name}</strong>
                  <div className="comment-meta">
                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>

                {(role === 'admin' || comment.user_id === userId) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="button button-secondary"
                  >
                    Удалить
                  </button>
                )}
              </div>

              <p className="comment-text">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {!userId ? (
        <p style={{ marginTop: 12 }}>
          Чтобы написать комментарий, <Link href="/login" style={{ color: '#2563eb', fontWeight: 600 }}>войти</Link>.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            className="textarea"
            placeholder="Напиши комментарий..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="status-error">{error}</p>}
    </section>
  )
}