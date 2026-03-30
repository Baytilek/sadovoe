import { createClient } from '@/lib/supabase/server'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: sections, error } = await supabase
    .from('history_sections')
    .select('id, title, content, image_url, sort_order')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return (
    <>
      <section className="hero">
        <h1>История айыла</h1>
        <p>
          Здесь собрана история нашего айыла, важные события, этапы развития и памятные места.
        </p>
      </section>

      <section className="grid">
        {error && <p className="status-error">{error.message}</p>}

        {!sections || sections.length === 0 ? (
          <div className="card">
            <p className="page-empty">Раздел истории пока пуст.</p>
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.id} className="card">
              {section.image_url && (
                <img
                  src={section.image_url}
                  alt={section.title}
                  style={{
                    width: '100%',
                    maxHeight: 340,
                    objectFit: 'cover',
                    borderRadius: 16,
                    marginBottom: 16,
                  }}
                />
              )}

              <h2 style={{ marginTop: 0, marginBottom: 12 }}>{section.title}</h2>

              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {section.content}
              </p>
            </section>
          ))
        )}
      </section>
    </>
  )
}