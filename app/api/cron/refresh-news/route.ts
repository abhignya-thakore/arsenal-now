import { createClient } from "@/lib/supabase/server"
import { scrapeAllSources } from "@/lib/scraper"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const url = new URL(request.url)
  const secretParam = url.searchParams.get("secret")

  const expectedSecret = process.env.CRON_SECRET

  console.log("[v0] Auth Debug:", {
    hasAuthHeader: !!authHeader,
    hasSecretParam: !!secretParam,
    hasExpectedSecret: !!expectedSecret,
    secretParamLength: secretParam?.length,
    expectedSecretLength: expectedSecret?.length,
  })

  const isAuthorized = authHeader === `Bearer ${expectedSecret}` || secretParam === expectedSecret

  if (!isAuthorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const articles = await scrapeAllSources()

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
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return Response.json({ error: "Failed to refresh news", details: String(error) }, { status: 500 })
  }
}

// Cron schedule configured in Vercel: daily at 9 AM UTC
