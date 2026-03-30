'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Resident = {
  id: number
  full_name: string
  phone: string | null
  birth_year: number | null
  instagram: string | null
  is_public: boolean
  photo_url: string | null
}

export default function AdminResidentsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [residents, setResidents] = useState<Resident[]>([])
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
        .from('residents')
        .select('id, full_name, phone, birth_year, instagram, is_public, photo_url')
        .order('full_name', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setResidents((data as Resident[]) ?? [])
      }

      setLoading(false)
    }

    loadData()
  }, [supabase])

  async function handleDelete(id: number) {
    const ok = window.confirm('Удалить жителя?')
    if (!ok) return

    const { error } = await supabase.from('residents').delete().eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setResidents((prev) => prev.filter((item) => item.id !== id))
  }

  async function handleTogglePublic(id: number, currentValue: boolean) {
    const { error } = await supabase
      .from('residents')
      .update({
        is_public: !currentValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setResidents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_public: !currentValue } : item
      )
    )
  }

  if (loading) return <section className="card">Загрузка...</section>

  if (!isAdmin) {
    return (
      <section className="card">
        <h1 className="section-title">Управление жителями</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Управление жителями</h1>
        <p>Здесь можно редактировать список жителей и управлять публичностью записей.</p>
      </section>

      <section className="card">
        <div className="admin-toolbar">
          <Link href="/admin/residents/add" className="button">Добавить жителя</Link>
          <Link href="/admin" className="button button-secondary">Назад в админку</Link>
          <Link href="/residents" className="button button-secondary">Открыть страницу</Link>
        </div>

        {error && <p className="status-error">{error}</p>}

        {residents.length === 0 ? (
          <p className="page-empty">Жителей пока нет.</p>
        ) : (
          <div className="grid">
            {residents.map((resident) => (
              <div key={resident.id} className="card">
                {resident.photo_url && (
                  <img
                    src={resident.photo_url}
                    alt={resident.full_name}
                    className="preview-image"
                    style={{ marginBottom: 14 }}
                  />
                )}

                <h2 style={{ marginTop: 0 }}>{resident.full_name}</h2>
                <p><strong>Телефон:</strong> {resident.phone || '—'}</p>
                <p><strong>Год рождения:</strong> {resident.birth_year || '—'}</p>
                <p><strong>Instagram:</strong> {resident.instagram || '—'}</p>
                <p><strong>Публично:</strong> {resident.is_public ? 'Да' : 'Нет'}</p>

                <div className="inline-actions">
                  <Link href={`/admin/residents/edit/${resident.id}`} className="button">
                    Редактировать
                  </Link>

                  <button
                    onClick={() => handleTogglePublic(resident.id, resident.is_public)}
                    className="button button-secondary"
                  >
                    {resident.is_public ? 'Скрыть' : 'Сделать публичным'}
                  </button>

                  <button
                    onClick={() => handleDelete(resident.id)}
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