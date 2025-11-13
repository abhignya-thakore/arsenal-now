import { createClient } from "@/lib/supabase/server"
import { ArticleCard } from "@/components/article-card"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { AdSlot } from "@/components/ad-slot"
import { SidebarAds } from "@/components/sidebar-ads"

export const metadata = {
  title: "ArsenalNow | Latest Arsenal FC News",
  description:
    "ArsenalNow - Curated one-sentence summaries of Arsenal FC news from top sources with direct links to full articles.",
}

export default async function Home() {
  const supabase = await createClient()

  // Fetch latest articles from last 7 days, grouped by source
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .gte("published_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("published_at", { ascending: false })
    .limit(100)

  const articlesBySource = (articles || []).reduce(
    (acc, article) => {
      if (!acc[article.source_name]) {
        acc[article.source_name] = []
      }
      acc[article.source_name].push(article)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const sources = Object.keys(articlesBySource).sort()
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">A</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">ArsenalNow</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-12">
            Daily Arsenal FC news from trusted sources. One-sentence summaries with direct links to full articles. Every
            story links you to the original source for complete coverage. Updated daily at 9 AM UTC.
          </p>

          {/* Newsletter Signup */}
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Subscribe</h2>
            <NewsletterSignup />
            <p className="text-xs text-muted-foreground mt-3">Get the best Arsenal news delivered to your inbox</p>
          </div>
        </div>
      </section>

      {/* Leaderboard Ad */}
      {adClient && (
        <section className="border-b border-border bg-muted/30 py-4">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <p className="text-xs text-muted-foreground font-semibold mb-3">ADVERTISEMENT</p>
            <AdSlot adSlot="5678901234" adClient={adClient} className="min-h-[90px]" />
          </div>
        </section>
      )}

      {/* Main Content with Sidebar */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="flex gap-10">
          {/* Articles Column */}
          <div className="flex-1">
            {sources.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-base">
                  No articles found yet. Check back soon for the latest Arsenal news!
                </p>
              </div>
            ) : (
              sources.map((source, index) => (
                <div key={source} className="mb-16">
                  <h2 className="text-2xl font-bold text-foreground mb-8 pb-4 border-b-2 border-primary">{source}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {(articlesBySource[source] || []).slice(0, 6).map((article) => (
                      <ArticleCard
                        key={article.id}
                        title={article.title}
                        summary={article.summary}
                        source={source}
                        url={article.article_url}
                        publishedAt={article.published_at}
                      />
                    ))}
                  </div>

                  {/* Mid-page Ad */}
                  {adClient && index < sources.length - 1 && (
                    <div className="bg-muted/50 border border-border rounded-sm p-8 mb-16">
                      <p className="text-xs text-muted-foreground font-semibold mb-3">ADVERTISEMENT</p>
                      <AdSlot adSlot="3456789012" adClient={adClient} className="min-h-[250px]" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sidebar Ads */}
          <SidebarAds />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center text-muted-foreground text-xs">
          <p>
            ArsenalNow curates news from Arseblog, Pain in the Arsenal, The Athletic, ESPN, Football London, and The
            Guardian
          </p>
          <p className="mt-2">
            Each story links to its original source. We respect copyright and provide summaries only.
          </p>
          <p className="mt-3">Updated daily • © 2025 abhignya thakore</p>
        </div>
      </footer>
    </main>
  )
}
