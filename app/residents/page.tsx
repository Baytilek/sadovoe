import { createClient } from '@/lib/supabase/server'

export default async function ResidentsPage() {
  const supabase = await createClient()

  const { data: residents, error } = await supabase
    .from('residents')
    .select('id, full_name, phone, birth_year, instagram, photo_url')
    .eq('is_public', true)
    .order('full_name', { ascending: true })

  return (
    <>
      <section className="hero">
        <h1>Жители айыла</h1>
        <p>
          Здесь находится информация о жителях нашего айыла, которую можно показывать публично.
        </p>
      </section>

      <section className="grid grid-2">
        {error && <p className="status-error">{error.message}</p>}

        {!residents || residents.length === 0 ? (
          <div className="card">
            <p className="page-empty">Список жителей пока пуст.</p>
          </div>
        ) : (
          residents.map((resident) => (
            <section key={resident.id} className="card">
              {resident.photo_url ? (
                <img
                  src={resident.photo_url}
                  alt={resident.full_name}
                  className="avatar"
                  style={{ width: 140, height: 140, marginBottom: 16 }}
                />
              ) : (
                <div
                  className="avatar"
                  style={{ width: 140, height: 140, marginBottom: 16 }}
                />
              )}

              <h2 style={{ marginTop: 0, marginBottom: 12 }}>{resident.full_name}</h2>

              <div className="meta-list">
                {resident.phone && (
                  <p><strong>Телефон:</strong> {resident.phone}</p>
                )}

                {resident.birth_year && (
                  <p><strong>Год рождения:</strong> {resident.birth_year}</p>
                )}

                {resident.instagram && (
                  <p>
                    <strong>Instagram:</strong>{' '}
                    <a
                      href={`https://instagram.com/${resident.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', fontWeight: 600 }}
                    >
                      {resident.instagram}
                    </a>
                  </p>
                )}
              </div>
            </section>
          ))
        )}
      </section>
    </>
  )
}