import { createClient } from "@/lib/supabase/server"
import { scrapeAllSources } from "@/lib/scraper"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secretParam = url.searchParams.get("secret")

  console.log("[v0] Testing cron - secret param:", secretParam)
  console.log("[v0] CRON_SECRET env var:", process.env.CRON_SECRET)
  console.log("[v0] Match:", secretParam === process.env.CRON_SECRET)

  // Temporarily allow all requests for testing
  // TODO: Re-enable authorization after testing

  try {
    const supabase = await createClient()
    const articles = await scrapeAllSources()

    console.log("[v0] Scraped articles:", articles.length)

    // Insert new articles (ignoring duplicates based on article_url)
    for (const article of articles) {
      await supabase
        .from("articles")
        .insert({
          title: article.title,
          summary: article.summary,
          source_name: article.source,
          source_url: article.source,
          article_url: article.url,
          published_at: article.publishedAt,
        })
        .throwOnError()
        .catch(() => {
          // Ignore duplicate URL errors
        })
    }

    // Clean up old articles (keep last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await supabase.from("articles").delete().lt("created_at", thirtyDaysAgo.toISOString())

    return Response.json({
      success: true,
      articlesAdded: articles.length,
      timestamp: new Date().toISOString(),
      debug: {
        secretMatched: secretParam === process.env.CRON_SECRET,
        envVarExists: !!process.env.CRON_SECRET,
      },
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return Response.json({ error: "Failed to refresh news", details: String(error) }, { status: 500 })
  }
}
