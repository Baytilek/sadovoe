'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [role, setRole] = useState('user')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserEmail(user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', user.id)
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setFullName(data.full_name || '')
        setAvatarUrl(data.avatar_url || '')
        setRole(data.role || 'user')
      }

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

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Профиль обновлен.')
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!userEmail) {
    return (
      <section className="card">
        <h1 className="section-title">Профиль</h1>
        <p className="page-empty">Сначала войди в аккаунт.</p>
        <div className="inline-actions" style={{ marginTop: 16 }}>
          <Link href="/login" className="button">Войти</Link>
          <Link href="/register" className="button button-secondary">Регистрация</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Профиль пользователя</h1>
        <p>Здесь можно изменить имя и ссылку на аватар.</p>
      </section>

      <section className="card form-card">
        <div className="profile-card" style={{ marginBottom: 24 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="avatar" />
          ) : (
            <div className="avatar" />
          )}

          <div className="meta-list">
            <p><strong>Email:</strong> {userEmail}</p>
            <p><strong>Роль:</strong> {role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            className="input"
            type="text"
            placeholder="Имя"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="input"
            type="text"
            placeholder="Ссылка на аватар"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>

            <Link href="/" className="button button-secondary">
              На главную
            </Link>
          </div>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}