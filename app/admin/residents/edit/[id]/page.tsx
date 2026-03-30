'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditResidentPage() {
  const supabase = useMemo(() => createClient(), [])
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [instagram, setInstagram] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPath, setPhotoPath] = useState('')
  const [newPhoto, setNewPhoto] = useState<File | null>(null)

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
        .from('residents')
        .select('full_name, phone, birth_year, instagram, is_public, photo_url, photo_path')
        .eq('id', Number(params.id))
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setFullName(data.full_name ?? '')
        setPhone(data.phone ?? '')
        setBirthYear(data.birth_year ? String(data.birth_year) : '')
        setInstagram(data.instagram ?? '')
        setIsPublic(data.is_public ?? true)
        setPhotoUrl(data.photo_url ?? '')
        setPhotoPath(data.photo_path ?? '')
      }

      setLoading(false)
    }

    loadData()
  }, [params.id, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setMessage('')

    let nextPhotoUrl = photoUrl || null
    let nextPhotoPath = photoPath || null

    if (newPhoto) {
      const ext = newPhoto.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `public/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('residents')
        .upload(path, newPhoto, {
          cacheControl: '3600',
          upsert: false,
          contentType: newPhoto.type,
        })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from('residents')
        .getPublicUrl(path)

      nextPhotoUrl = data.publicUrl
      nextPhotoPath = path
    }

    const oldPhotoPath = photoPath

    const { error } = await supabase
      .from('residents')
      .update({
        full_name: fullName,
        phone: phone || null,
        birth_year: birthYear ? Number(birthYear) : null,
        instagram: instagram || null,
        is_public: isPublic,
        photo_url: nextPhotoUrl,
        photo_path: nextPhotoPath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(params.id))

    if (error) {
      setError(error.message)
      return
    }

    if (newPhoto && oldPhotoPath) {
      await supabase.storage.from('residents').remove([oldPhotoPath])
    }

    setMessage('Информация обновлена.')
    router.push('/admin/residents')
    router.refresh()
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Редактировать жителя</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Редактировать жителя</h1>
        <p>Измени данные жителя, фото и публичность отображения.</p>
      </section>

      <section className="card form-card">
        <div className="admin-toolbar">
          <Link href="/admin/residents" className="button button-secondary">Назад</Link>
          <Link href="/residents" className="button button-secondary">Открыть страницу</Link>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={fullName}
              className="preview-image"
            />
          )}

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
            placeholder="Instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />

          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setNewPhoto(e.target.files?.[0] || null)}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Показать на публичной странице
          </label>

          <button type="submit">Сохранить изменения</button>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}