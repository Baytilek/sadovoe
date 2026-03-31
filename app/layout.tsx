import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import SiteMenu from '@/components/SiteMenu'

export const metadata: Metadata = {
  title: 'Sadovoe',
  description: 'Информационный сайт ',
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
                Sadovoe
              </Link>

              <SiteMenu
                isLoggedIn={!!user}
                isAdmin={profile?.role === 'admin'}
              />
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