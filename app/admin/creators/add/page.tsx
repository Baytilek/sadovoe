'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddCreatorPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [fullName, setFullName] = useState('')
  const [roleText, setRoleText] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [bio, setBio] = useState('')
  const [contactLink, setContactLink] = useState('')
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

    const { error } = await supabase.from('creators').insert({
      full_name: fullName,
      role_text: roleText,
      photo_url: photoUrl || null,
      bio: bio || null,
      contact_link: contactLink || null,
      sort_order: Number(sortOrder),
    })

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Создатель добавлен.')
    setFullName('')
    setRoleText('')
    setPhotoUrl('')
    setBio('')
    setContactLink('')
    setSortOrder(0)
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Добавить создателя</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Добавить создателя</h1>
        <p>Добавь нового человека в раздел создателей сайта.</p>
      </section>

      <section className="card form-card">
        <div className="admin-toolbar">
          <Link href="/admin/creators" className="button button-secondary">Назад</Link>
          <Link href="/creators" className="button button-secondary">Открыть страницу</Link>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            className="input"
            type="text"
            placeholder="Имя и фамилия"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Роль"
            value={roleText}
            onChange={(e) => setRoleText(e.target.value)}
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Ссылка на фото"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

          <textarea
            className="textarea"
            placeholder="Описание"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={6}
          />

          <input
            className="input"
            type="text"
            placeholder="Ссылка для связи"
            value={contactLink}
            onChange={(e) => setContactLink(e.target.value)}
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