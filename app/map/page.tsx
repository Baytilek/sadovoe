import VillageMap from '@/components/VillageMap'
import { createClient } from '@/lib/supabase/server'

export default async function MapPage() {
  const supabase = await createClient()

  const { data: points, error } = await supabase
    .from('map_points')
    .select('id, title, description, lat, lng, type')
    .eq('is_public', true)
    .order('created_at', { ascending: true })

  return (
    <>
      <section className="hero">
        <h1>Карта айыла</h1>
        <p>
          Здесь показаны важные места нашего айыла на настоящей карте.
        </p>
      </section>

      <section className="card" style={{ marginBottom: 20 }}>
        {error && <p className="status-error">{error.message}</p>}
        <VillageMap points={points ?? []} />
      </section>

      <section className="card">
        <h2 className="section-title">Точки на карте</h2>

        {!points || points.length === 0 ? (
          <p className="page-empty">Публичных точек пока нет.</p>
        ) : (
          <div className="grid grid-2">
            {points.map((point) => (
              <div key={point.id} className="news-item">
                <h3 style={{ marginTop: 0 }}>{point.title}</h3>
                {point.type && <p><strong>Тип:</strong> {point.type}</p>}
                {point.description && (
                  <p style={{ whiteSpace: 'pre-wrap' }}>{point.description}</p>
                )}
                <p style={{ color: '#6b7280', marginBottom: 0 }}>
                  {point.lat}, {point.lng}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}