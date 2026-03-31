import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <section className="card">
        <h1 className="section-title">Админ-панель</h1>
        <p className="page-empty">Сначала войди в аккаунт.</p>
      </section>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <section className="card">
        <h1 className="section-title">Админ-панель</h1>
        <p className="status-error">Доступ запрещен.</p>
      </section>
    )
  }

  return (
    <>
      <section className="hero">
        <h1>Админ-панель</h1>
        <p>
          Здесь ты можешь управлять статьями, историей, создателями, жителями и картой сайта.
        </p>
      </section>

      <section className="card">
        <h2 className="section-title">
          Добро пожаловать, {profile.full_name || 'Админ'}
        </h2>

        <div className="grid grid-2">
          <Link href="/add-article" className="news-item">
            Добавить статью
          </Link>
          <Link href="/admin/articles" className="news-item">
           Управление статьями
          </Link>

          <Link href="/admin/history" className="news-item">
            Управление историей
          </Link>

          <Link href="/admin/creators" className="news-item">
            Управление создателями
          </Link>

          <Link href="/admin/residents" className="news-item">
            Управление жителями
          </Link>

          <Link href="/admin/map" className="news-item">
            Управление картой
          </Link>

          <Link href="/news" className="news-item">
            Смотреть новости
          </Link>

          <Link href="/" className="news-item">
            На главную
          </Link>
        </div>
      </section>
    </>
  )
}