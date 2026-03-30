'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

type Props = {
  isLoggedIn: boolean
  isAdmin: boolean
}

export default function SiteMenu({ isLoggedIn, isAdmin }: Props) {
  const [open, setOpen] = useState(false)

  function closeMenu() {
    setOpen(false)
  }

  return (
    <div className="site-menu">
      <button
        className="menu-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Открыть меню"
      >
        ☰
      </button>

      <nav className={`site-nav-wrap ${open ? 'open' : ''}`}>
        <Link href="/" onClick={closeMenu}>Главная</Link>
        <Link href="/news" onClick={closeMenu}>Новости</Link>
        <Link href="/history" onClick={closeMenu}>История</Link>
        <Link href="/residents" onClick={closeMenu}>Жители</Link>
        <Link href="/map" onClick={closeMenu}>Карта</Link>
        <Link href="/creators" onClick={closeMenu}>Создатели</Link>

        {!isLoggedIn ? (
          <>
            <Link href="/login" onClick={closeMenu}>Вход</Link>
            <Link href="/register" onClick={closeMenu}>Регистрация</Link>
          </>
        ) : (
          <>
            <Link href="/profile" onClick={closeMenu}>Профиль</Link>
            {isAdmin && <Link href="/admin" onClick={closeMenu}>Админка</Link>}
            <div className="site-nav-logout">
              <LogoutButton />
            </div>
          </>
        )}
      </nav>
    </div>
  )
}