interface ArticleCardProps {
  title: string
  summary: string
  source: string
  url: string
  publishedAt: string
}

export function ArticleCard({ title, summary, source, url, publishedAt }: ArticleCardProps) {
  const publishDate = new Date(publishedAt)
  const formattedDate = publishDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <article className="bg-card border border-border rounded-sm p-6 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-sm hover:bg-primary/20 transition-colors"
        >
          Read at {source} →
        </a>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedDate}</span>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{summary}</p>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-xs px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors"
      >
        Read Full Article on {source} →
      </a>
    </article>
  )
}
