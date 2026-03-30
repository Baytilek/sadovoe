'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddResidentPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [instagram, setInstagram] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [photo, setPhoto] = useState<File | null>(null)

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

    let photoUrl: string | null = null
    let photoPath: string | null = null

    if (photo) {
      const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `public/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('residents')
        .upload(path, photo, {
          cacheControl: '3600',
          upsert: false,
          contentType: photo.type,
        })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from('residents')
        .getPublicUrl(path)

      photoUrl = data.publicUrl
      photoPath = path
    }

    const { error } = await supabase.from('residents').insert({
      full_name: fullName,
      phone: phone || null,
      birth_year: birthYear ? Number(birthYear) : null,
      instagram: instagram || null,
      is_public: isPublic,
      photo_url: photoUrl,
      photo_path: photoPath,
    })

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Житель добавлен.')
    setFullName('')
    setPhone('')
    setBirthYear('')
    setInstagram('')
    setIsPublic(true)
    setPhoto(null)
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Добавить жителя</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Добавить жителя</h1>
        <p>Заполни данные жителя и при необходимости загрузи его фото.</p>
      </section>

      <section className="card form-card">
        <div className="admin-toolbar">
          <Link href="/admin/residents" className="button button-secondary">Назад</Link>
          <Link href="/residents" className="button button-secondary">Открыть страницу</Link>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            className="input"
            type="text"
            placeholder="ФИО"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            className="input"
            type="text"
            placeholder="Номер телефона"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="input"
            type="number"
            placeholder="Год рождения"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          />

          <input
            className="input"
            type="text"
            placeholder="Instagram (например @username)"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />

          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Показать на публичной странице
          </label>

          <button type="submit">Сохранить</button>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}