import { createClient } from '@/lib/supabase/server'
import ArticleComments from '@/components/ArticleComments'

export default async function NewsPage() {
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, image_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <>
      <section className="hero">
        <h1>Новости айыла</h1>
        <p>
          Здесь публикуются важные события, объявления и новости нашего айыла.
        </p>
      </section>

      <section className="grid">
        {error && <p className="status-error">{error.message}</p>}

        {!articles || articles.length === 0 ? (
          <div className="card">
            <p className="page-empty">Пока опубликованных новостей нет.</p>
          </div>
        ) : (
          articles.map((article) => (
            <article key={article.id} className="card">
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  style={{
                    width: '100%',
                    maxHeight: 340,
                    objectFit: 'cover',
                    borderRadius: 16,
                    marginBottom: 16,
                  }}
                />
              )}

              <h2 style={{ marginTop: 0, marginBottom: 12 }}>{article.title}</h2>

              <p style={{ color: '#6b7280', marginBottom: 14 }}>
                {article.created_at
                  ? new Date(article.created_at).toLocaleString('ru-RU')
                  : ''}
              </p>

              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {article.content}
              </p>
              <ArticleComments articleId={article.id} />
            </article>
          ))
        )}
      </section>
    </>
  )
}