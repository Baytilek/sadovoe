'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)

    const { error } = await supabase.auth.signOut()

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Выход...' : 'Выйти'}
    </button>
  )
}