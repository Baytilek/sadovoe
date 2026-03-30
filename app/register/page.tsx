'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Аккаунт создан. Проверь почту и подтверди регистрацию.')
    setFullName('')
    setEmail('')
    setPassword('')

    router.push('/login')
  }

  return (
    <section className="card form-card">
      <h1 className="section-title">Регистрация</h1>
      <p className="page-empty">Создай аккаунт для входа на сайт айыла.</p>

      <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 20 }}>
        <input
          className="input"
          type="text"
          placeholder="Имя"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

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
          {loading ? 'Создание...' : 'Зарегистрироваться'}
        </button>
      </form>

      {error && <p className="status-error">{error}</p>}
      {message && <p className="status-success">{message}</p>}

      <p style={{ marginTop: 20 }}>
        Уже есть аккаунт?{' '}
        <Link href="/login" style={{ color: '#2563eb', fontWeight: 600 }}>
          Войти
        </Link>
      </p>
    </section>
  )
}