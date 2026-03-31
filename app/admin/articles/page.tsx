'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Article = {
  id: number
  title: string
  status: 'draft' | 'published'
  created_at: string
}

export default function AdminArticlesPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
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
        .from('articles')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setArticles((data as Article[]) ?? [])
      }

      setLoading(false)
    }

    loadData()
  }, [supabase])

  async function handleDelete(id: number) {
    const ok = window.confirm('Удалить эту статью?')
    if (!ok) return

    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setArticles((prev) => prev.filter((article) => article.id !== id))
  }

  async function handleToggleStatus(id: number, currentStatus: 'draft' | 'published') {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'

    const { error } = await supabase
      .from('articles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setArticles((prev) =>
      prev.map((article) =>
        article.id === id ? { ...article, status: newStatus } : article
      )
    )
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Управление статьями</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Управление статьями</h1>
        <p>Здесь можно редактировать, удалять и публиковать статьи.</p>
      </section>

      <section className="card">
        <div className="admin-toolbar">
          <Link href="/add-article" className="button">Добавить статью</Link>
          <Link href="/admin" className="button button-secondary">Назад в админку</Link>
          <Link href="/news" className="button button-secondary">Открыть новости</Link>
        </div>

        {error && <p className="status-error">{error}</p>}

        {articles.length === 0 ? (
          <p className="page-empty">Статей пока нет.</p>
        ) : (
          <div className="grid">
            {articles.map((article) => (
              <div key={article.id} className="card">
                <h2 style={{ marginTop: 0 }}>{article.title}</h2>
                <p><strong>ID:</strong> {article.id}</p>
                <p><strong>Статус:</strong> {article.status}</p>

                <div className="inline-actions">
                  <Link href={`/admin/edit/${article.id}`} className="button">
                    Редактировать
                  </Link>

                  <button
                    onClick={() => handleToggleStatus(article.id, article.status)}
                    className="button button-secondary"
                  >
                    {article.status === 'published'
                      ? 'Снять с публикации'
                      : 'Опубликовать'}
                  </button>

                  <button
                    onClick={() => handleDelete(article.id)}
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