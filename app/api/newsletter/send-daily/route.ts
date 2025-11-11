import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify the request is from Vercel
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Get latest articles from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const { data: articles } = await supabase
      .from("articles")
      .select("*")
      .gte("published_at", oneDayAgo.toISOString())
      .order("published_at", { ascending: false })

    if (!articles || articles.length === 0) {
      return Response.json({
        success: true,
        message: "No new articles to send",
      })
    }

    // Get all verified subscribers
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("verified", true)
      .is("unsubscribed_at", null)

    if (!subscribers || subscribers.length === 0) {
      return Response.json({
        success: true,
        message: "No subscribers",
      })
    }

    // Group articles by source
    const articlesBySource = articles.reduce(
      (acc, article) => {
        if (!acc[article.source_name]) {
          acc[article.source_name] = []
        }
        acc[article.source_name].push(article)
        return acc
      },
      {} as Record<string, typeof articles>,
    )

    // Generate HTML email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DB0007; border-bottom: 3px solid #DB0007; padding-bottom: 10px;">Arsenal News Digest</h1>
        <p>Here's today's top Arsenal news from your favorite sources:</p>
        
        ${Object.entries(articlesBySource)
          .map(
            ([source, sourceArticles]) => `
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-left: 4px solid #DB0007;">
            <h2 style="color: #DB0007; margin-top: 0;">${source}</h2>
            ${sourceArticles
              .slice(0, 3)
              .map(
                (article) => `
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
                <h3 style="margin-top: 0; color: #333;">
                  <a href="${article.article_url}" style="color: #DB0007; text-decoration: none;">
                    ${article.title}
                  </a>
                </h3>
                <p style="color: #666; margin: 10px 0;">${article.summary}</p>
                <a href="${article.article_url}" style="color: #DB0007; font-weight: bold; text-decoration: none;">Read More →</a>
                <p style="font-size: 12px; color: #999; margin: 5px 0 0 0;">
                  ${new Date(article.published_at).toLocaleDateString()}
                </p>
              </div>
            `,
              )
              .join("")}
          </div>
        `,
          )
          .join("")}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
          <p>This is your daily Arsenal news digest. To manage your subscription preferences, please visit our website.</p>
        </div>
      </div>
    `

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      await resend.emails.send({
        from: "Arsenal News <noreply@arsenal-news.com>",
        to: subscriber.email,
        subject: "Your Daily Arsenal News Digest",
        html: emailHtml,
      })
    }

    return Response.json({
      success: true,
      emailsSent: subscribers.length,
      articlesIncluded: articles.length,
    })
  } catch (error) {
    console.error("Newsletter send error:", error)
    return Response.json({ error: "Failed to send newsletter", details: String(error) }, { status: 500 })
  }
}
