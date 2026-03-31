'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [role, setRole] = useState('user')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
  async function loadProfile() {
    try {
      setError('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)
      setUserEmail(user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, avatar_path, role')
        .eq('id', user.id)
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setFullName(data.full_name || '')
        setAvatarUrl(data.avatar_url || '')
        setAvatarPath(data.avatar_path || '')
        setRole(data.role || 'user')
      }
    } catch (err) {
      setError('Не удалось загрузить профиль.')
    } finally {
      setLoading(false)
    }
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

    let nextAvatarUrl = avatarUrl || null
    let nextAvatarPath = avatarPath || null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: avatarFile.type,
        })

      if (uploadError) {
        setError(uploadError.message)
        setSaving(false)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      nextAvatarUrl = data.publicUrl
      nextAvatarPath = path
    }

    const oldAvatarPath = avatarPath

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: nextAvatarUrl,
        avatar_path: nextAvatarPath,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    if (avatarFile && oldAvatarPath) {
      await supabase.storage.from('avatars').remove([oldAvatarPath])
    }

    setAvatarUrl(nextAvatarUrl || '')
    setAvatarPath(nextAvatarPath || '')
    setAvatarFile(null)
    setMessage('Профиль обновлен.')
    setSaving(false)
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
        <p>Здесь можно изменить имя и загрузить аватарку файлом.</p>
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
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
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