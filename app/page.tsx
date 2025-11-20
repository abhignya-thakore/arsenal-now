import { createClient } from "@/lib/supabase/server"
import { ArticleCard } from "@/components/article-card"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { AdSlot } from "@/components/ad-slot"
import { SidebarAds } from "@/components/sidebar-ads"
import { getArsenalResults, getArsenalFixtures } from "@/lib/football-api"
import { MatchCard } from "@/components/match-card"

export const metadata = {
  title: "ArsenalNow | Latest Arsenal FC News",
  description:
    "ArsenalNow - Curated one-sentence summaries of Arsenal FC news from top sources with direct links to full articles.",
}

export default async function Home() {
  const supabase = await createClient()

  const [{ data: articles }, results, fixtures] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .gte("published_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("published_at", { ascending: false })
      .limit(100),
    getArsenalResults(5),
    getArsenalFixtures(5),
  ])

  const articlesByDate = (articles || []).reduce(
    (acc, article) => {
      const date = new Date(article.published_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!acc[date]) {
        acc[date] = {}
      }
      if (!acc[date][article.source_name]) {
        acc[date][article.source_name] = []
      }
      acc[date][article.source_name].push(article)
      return acc
    },
    {} as Record<string, Record<string, any[]>>,
  )

  const dates = Object.keys(articlesByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""

  return (
    <main className="min-h-screen bg-background">
      {/* Top Banner Ad */}
      {adClient && (
        <section className="border-b border-border bg-muted/30 py-3">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <p className="text-xs text-muted-foreground font-semibold mb-2">ADVERTISEMENT</p>
            <AdSlot adSlot="9876543210" adClient={adClient} className="min-h-[90px]" />
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left side - Logo, title, description, newsletter */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">A</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">ArsenalNow</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-12">
                Daily Arsenal FC news from trusted sources. Headlines with direct links to full articles. Every story
                links you to the original source for complete coverage. Updated daily at 9 AM UTC.
              </p>

              {/* Newsletter Signup */}
              <div className="max-w-sm">
                <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Subscribe</h2>
                <NewsletterSignup />
                <p className="text-xs text-muted-foreground mt-3">Get the best Arsenal news delivered to your inbox</p>
              </div>
            </div>

            {/* Right side - Fixtures and Results (compact on desktop) */}
            <div className="lg:w-80 space-y-6">
              {/* Recent Results */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Recent Results
                </h2>
                <div className="space-y-2">
                  {results.length > 0 ? (
                    results.map((match) => (
                      <MatchCard
                        key={match.id}
                        homeTeam={match.homeTeam.name}
                        awayTeam={match.awayTeam.name}
                        homeScore={match.score.fullTime.home}
                        awayScore={match.score.fullTime.away}
                        date={match.utcDate}
                        competition={match.competition.name}
                        isResult={true}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No recent results available</p>
                  )}
                </div>
              </div>

              {/* Upcoming Fixtures */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Upcoming Fixtures
                </h2>
                <div className="space-y-2">
                  {fixtures.length > 0 ? (
                    fixtures.map((match) => (
                      <MatchCard
                        key={match.id}
                        homeTeam={match.homeTeam.name}
                        awayTeam={match.awayTeam.name}
                        date={match.utcDate}
                        competition={match.competition.name}
                        isResult={false}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No upcoming fixtures available</p>
                  )}
                </div>
              </div>
            </div>
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
            {dates.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-base">
                  No articles found yet. Check back soon for the latest Arsenal news!
                </p>
              </div>
            ) : (
              dates.map((date, dateIndex) => {
                const sources = Object.keys(articlesByDate[date]).sort()
                return (
                  <div key={date} className="mb-20">
                    {/* Date Header */}
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold text-foreground mb-2">{date}</h2>
                      <div className="h-1 w-20 bg-primary rounded-sm"></div>
                    </div>

                    {/* Sources within this date */}
                    {sources.map((source) => (
                      <div key={`${date}-${source}`} className="mb-12">
                        <h3 className="text-xl font-semibold text-foreground mb-6 pb-3 border-b border-border flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {source}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {articlesByDate[date][source].map((article) => (
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
                      </div>
                    ))}

                    {/* Mid-page Ad between dates */}
                    {adClient && dateIndex < dates.length - 1 && (
                      <div className="bg-muted/50 border border-border rounded-sm p-8 mb-12">
                        <p className="text-xs text-muted-foreground font-semibold mb-3">ADVERTISEMENT</p>
                        <AdSlot adSlot="3456789012" adClient={adClient} className="min-h-[250px]" />
                      </div>
                    )}
                  </div>
                )
              })
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
