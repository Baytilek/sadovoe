'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <section className="card form-card">
      <h1 className="section-title">Вход</h1>
      <p className="page-empty">Войди в аккаунт, чтобы пользоваться сайтом.</p>

      <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 20 }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      {error && <p className="status-error">{error}</p>}

      <p style={{ marginTop: 20 }}>
        Нет аккаунта?{' '}
        <Link href="/register" style={{ color: '#2563eb', fontWeight: 600 }}>
          Регистрация
        </Link>
      </p>
    </section>
  )
}