import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let articles: any[] = []

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()

    profile = data
  }

  const { data: publishedArticles } = await supabase
    .from('articles')
    .select('id, title, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5)

  articles = publishedArticles ?? []

  return (
    <>
      <section className="hero">
        <h1>Добро пожаловать  </h1>
        <p>
           Погрузись в атмосферу нашего айыла и будь в курсе всех событий! 
        </p>
      </section>

      <div className="grid grid-2">
        <section className="card">
          <h2 className="section-title">Профиль</h2>

          {!user ? (
            <>
              <p className="page-empty">Ты еще не вошел в аккаунт.</p>
              <div className="inline-actions">
                <Link href="/login" className="button">Войти</Link>
                <Link href="/register" className="button button-secondary">Регистрация</Link>
              </div>
            </>
          ) : (
            <div className="profile-card">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="avatar"
                />
              ) : (
                <div className="avatar" />
              )}

              <div className="meta-list">
                <p><strong>Имя:</strong> {profile?.full_name || 'Без имени'}</p>
                <p><strong>Роль:</strong> {profile?.role || 'user'}</p>

                {profile?.role === 'admin' && (
                  <div className="inline-actions">
                    <Link href="/admin" className="button">
                      Админка
                    </Link>
                    <Link href="/add-article" className="button button-secondary">
                      Добавить статью
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Быстрые разделы</h2>

          <div className="news-list">
            <Link href="/news" className="news-item">Новости айыла</Link>
            <Link href="/history" className="news-item">История айыла</Link>
            <Link href="/residents" className="news-item">Жители айыла</Link>
            <Link href="/map" className="news-item">Карта айыла</Link>
            <Link href="/creators" className="news-item">Создатели сайта</Link>
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <h2 className="section-title">Последние новости</h2>

        {articles.length === 0 ? (
          <p className="page-empty">Пока опубликованных статей нет.</p>
        ) : (
          <div className="news-list">
            {articles.map((article) => (
              <div key={article.id} className="news-item">
                {article.title}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}