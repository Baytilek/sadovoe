'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EditCreatorPage() {
  const supabase = useMemo(() => createClient(), [])
  const params = useParams<{ id: string }>()
  const router = useRouter()

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
        .from('creators')
        .select('full_name, role_text, photo_url, bio, contact_link, sort_order')
        .eq('id', Number(params.id))
        .single()

      if (error) {
        setError(error.message)
      } else if (data) {
        setFullName(data.full_name ?? '')
        setRoleText(data.role_text ?? '')
        setPhotoUrl(data.photo_url ?? '')
        setBio(data.bio ?? '')
        setContactLink(data.contact_link ?? '')
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
      .from('creators')
      .update({
        full_name: fullName,
        role_text: roleText,
        photo_url: photoUrl || null,
        bio: bio || null,
        contact_link: contactLink || null,
        sort_order: Number(sortOrder),
        updated_at: new Date().toISOString(),
      })
      .eq('id', Number(params.id))

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Информация обновлена.')
    router.push('/admin/creators')
    router.refresh()
  }

  if (loading) {
    return <section className="card">Загрузка...</section>
  }

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Редактировать создателя</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Редактировать создателя</h1>
        <p>Измени имя, роль, фото и описание создателя сайта.</p>
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

          <button type="submit">Сохранить изменения</button>
        </form>

        {error && <p className="status-error">{error}</p>}
        {message && <p className="status-success">{message}</p>}
      </section>
    </>
  )
}