import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export const metadata: Metadata = {
  title: 'Сайт айыла',
  description: 'Информационный сайт айыла',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    profile = data
  }

  return (
    <html lang="ru">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="site-header-inner">
              <Link href="/" className="site-logo">
                Сайт айыла
              </Link>

              <nav className="site-nav">
                <Link href="/">Главная</Link>
                <Link href="/news">Новости</Link>
                <Link href="/history">История</Link>
                <Link href="/residents">Жители</Link>
                <Link href="/map">Карта</Link>
                <Link href="/creators">Создатели</Link>

                {!user ? (
                  <>
                    <Link href="/login">Вход</Link>
                    <Link href="/register">Регистрация</Link>
                  </>
                ) : (
                  <>
                    <Link href="/profile">Профиль</Link>
                    {profile?.role === 'admin' && <Link href="/admin">Админка</Link>}
                  </>
                )}
              </nav>

              {user && <LogoutButton />}
            </div>
          </header>

          <main className="site-main">{children}</main>

          <footer className="site-footer">
            © 2026 Сайт айыла
          </footer>
        </div>
      </body>
    </html>
  )
}