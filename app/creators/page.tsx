import { createClient } from '@/lib/supabase/server'

export default async function CreatorsPage() {
  const supabase = await createClient()

  const { data: creators, error } = await supabase
    .from('creators')
    .select('id, full_name, role_text, photo_url, bio, contact_link, sort_order')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <>
      <section className="hero">
        <h1>Создатели сайта</h1>
        <p>
          Здесь представлена информация о людях, которые участвовали в создании и развитии сайта айыла.
        </p>
      </section>

      <section className="grid grid-2">
        {error && <p className="status-error">{error.message}</p>}

        {!creators || creators.length === 0 ? (
          <div className="card">
            <p className="page-empty">Информация о создателях пока не добавлена.</p>
          </div>
        ) : (
          creators.map((creator) => (
            <section key={creator.id} className="card">
              {creator.photo_url ? (
                <img
                  src={creator.photo_url}
                  alt={creator.full_name}
                  className="avatar"
                  style={{ width: 140, height: 140, marginBottom: 16 }}
                />
              ) : (
                <div
                  className="avatar"
                  style={{ width: 140, height: 140, marginBottom: 16 }}
                />
              )}

              <h2 style={{ marginTop: 0, marginBottom: 10 }}>{creator.full_name}</h2>
              <p style={{ marginTop: 0, marginBottom: 14, color: '#2563eb', fontWeight: 700 }}>
                {creator.role_text}
              </p>

              {creator.bio && (
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {creator.bio}
                </p>
              )}

              {creator.contact_link && (
                <div style={{ marginTop: 16 }}>
                  <a
                    href={creator.contact_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button"
                    style={{ display: 'inline-block' }}
                  >
                    Связаться
                  </a>
                </div>
              )}
            </section>
          ))
        )}
      </section>
    </>
  )
}