import { createClient } from "@/lib/supabase/server"
import { scrapeAllSources } from "@/lib/scraper"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const url = new URL(request.url)
  const secretParam = url.searchParams.get("secret")

  const expectedSecret = process.env.CRON_SECRET
  const providedSecret = authHeader?.replace("Bearer ", "") || secretParam

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const articles = await scrapeAllSources()

    let inserted = 0
    let skipped = 0
    const errors: Array<{ article: string; error: string }> = []

    for (const article of articles) {
      console.log("[v0] Attempting to insert article:", article.title)

      const { error } = await supabase.from("articles").insert({
        title: article.title,
        summary: article.summary,
        source_name: article.source,
        source_url: article.sourceUrl,
        article_url: article.url,
        published_at: article.publishedAt,
      })

      if (error) {
        console.error("[v0] Error inserting article:", article.title, error)
        if (error.message.includes("duplicate") || error.message.includes("unique")) {
          skipped++
        } else {
          errors.push({ article: article.title, error: error.message })
        }
      } else {
        console.log("[v0] Successfully inserted:", article.title)
        inserted++
      }
    }

    // Clean up old articles (keep last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await supabase.from("articles").delete().lt("created_at", thirtyDaysAgo.toISOString())

    return Response.json({
      success: true,
      scraped: articles.length,
      inserted,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      sources: {
        Arseblog: articles.filter((a) => a.source === "Arseblog").length,
        "Pain in the Arsenal": articles.filter((a) => a.source === "Pain in the Arsenal").length,
        ESPN: articles.filter((a) => a.source === "ESPN").length,
        "Football London": articles.filter((a) => a.source === "Football London").length,
        "The Guardian": articles.filter((a) => a.source === "The Guardian").length,
        "The Athletic": articles.filter((a) => a.source === "The Athletic").length,
      },
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return Response.json({ error: "Failed to refresh news", details: String(error) }, { status: 500 })
  }
}
