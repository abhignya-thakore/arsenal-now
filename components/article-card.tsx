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
    <article className="bg-card border border-border rounded-sm p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3 mb-3">
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

      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
        {title}
      </h3>
    </article>
  )
}
