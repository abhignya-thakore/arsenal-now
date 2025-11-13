import * as cheerio from "cheerio"

interface ScrapedArticle {
  title: string
  summary: string
  url: string
  publishedAt: Date
  source: string
  sourceUrl: string
}

function extractFirstSentence(text: string): string {
  // Remove HTML tags
  const cleaned = text.replace(/<[^>]*>/g, "").trim()
  // Extract first sentence (ends with . ! or ?)
  const match = cleaned.match(/^[^.!?]*[.!?]/)
  return match ? match[0] : cleaned.substring(0, 150) + "..."
}

// Arseblog scraper (RSS)
async function scrapeArseblog(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://arseblog.com/feed", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Arseblog RSS HTTP error: ${response.status}`)
      return articles
    }

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const items = $("item")
    console.log(`[v0] Arseblog RSS found ${items.length} items`)

    items.slice(0, 3).each((_, el) => {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      if (title && url) {
        articles.push({
          title,
          summary: extractFirstSentence(description) || "Read the full article for details.",
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "Arseblog",
          sourceUrl: "https://arseblog.com",
        })
      }
    })

    console.log(`[v0] Arseblog parsed ${articles.length} articles`)
  } catch (error) {
    console.error("[v0] Error scraping Arseblog RSS:", error)
  }
  return articles
}

// Pain in the Arsenal scraper (HTML)
async function scrapePainInArsenal(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://www.paininthearsenal.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    const html = await response.text()
    const $ = cheerio.load(html)

    $(".post-item")
      .slice(0, 3)
      .each((_, el) => {
        const titleEl = $(el).find(".post-title a, h2 a").first()
        const title = titleEl.text().trim()
        const url = titleEl.attr("href")
        const excerpt = $(el).find(".post-excerpt, .post-content p").first().text().trim()
        const dateText = $(el).find(".post-date, time").attr("datetime")

        if (title && url && excerpt) {
          articles.push({
            title,
            summary: extractFirstSentence(excerpt),
            url: url.startsWith("http") ? url : `https://www.paininthearsenal.com${url}`,
            publishedAt: new Date(dateText || new Date()),
            source: "Pain in the Arsenal",
            sourceUrl: "https://www.paininthearsenal.com",
          })
        }
      })
  } catch (error) {
    console.error("Error scraping Pain in the Arsenal:", error)
  }
  return articles
}

async function scrapeEspn(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    // Try Arsenal-specific feed first
    const response = await fetch("https://www.espn.com/espn/rss/soccer/news", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.error(`[v0] ESPN HTTP error: ${response.status}`)
      return articles
    }

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const items = $("item")
    console.log(`[v0] ESPN found ${items.length} total items`)

    items.each((_, el) => {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      // Filter for Arsenal articles
      if (title && url && title.toLowerCase().includes("arsenal")) {
        articles.push({
          title,
          summary: extractFirstSentence(description) || "Read the full article for details.",
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "ESPN",
          sourceUrl: "https://www.espn.com",
        })
      }
    })

    console.log(`[v0] ESPN found ${articles.length} Arsenal articles`)
  } catch (error) {
    console.error("[v0] Error scraping ESPN RSS:", error)
  }
  return articles.slice(0, 3)
}

async function scrapeGuardian(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://www.theguardian.com/football/arsenal/rss")
    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    $("item")
      .slice(0, 3)
      .each((_, el) => {
        const title = $(el).find("title").text().trim()
        const url = $(el).find("link").text().trim()
        const description = $(el).find("description").text().trim()
        const pubDate = $(el).find("pubDate").text().trim()

        if (title && url) {
          articles.push({
            title,
            summary: extractFirstSentence(description),
            url,
            publishedAt: new Date(pubDate || new Date()),
            source: "The Guardian",
            sourceUrl: "https://www.theguardian.com",
          })
        }
      })
  } catch (error) {
    console.error("Error scraping The Guardian RSS:", error)
  }
  return articles
}

async function scrapeFootballLondon(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://www.football.london/arsenal-fc/?service=rss")
    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    $("item")
      .slice(0, 3)
      .each((_, el) => {
        const title = $(el).find("title").text().trim()
        const url = $(el).find("link").text().trim()
        const description = $(el).find("description").text().trim()
        const pubDate = $(el).find("pubDate").text().trim()

        if (title && url) {
          articles.push({
            title,
            summary: extractFirstSentence(description),
            url,
            publishedAt: new Date(pubDate || new Date()),
            source: "Football London",
            sourceUrl: "https://www.football.london",
          })
        }
      })
  } catch (error) {
    console.error("Error scraping Football London RSS:", error)
  }
  return articles
}

async function scrapeAthletic(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://theathletic.com/rss/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.error(`[v0] The Athletic HTTP error: ${response.status}`)
      return articles
    }

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const items = $("item")
    console.log(`[v0] The Athletic found ${items.length} total items`)

    items.each((_, el) => {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      // Filter for Arsenal articles
      if (title && url && title.toLowerCase().includes("arsenal")) {
        articles.push({
          title,
          summary: extractFirstSentence(description) || "Read the full article for details.",
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "The Athletic",
          sourceUrl: "https://theathletic.com",
        })
      }
    })

    console.log(`[v0] The Athletic found ${articles.length} Arsenal articles`)
  } catch (error) {
    console.error("[v0] Error scraping The Athletic RSS:", error)
  }
  return articles.slice(0, 3)
}

export async function scrapeAllSources(): Promise<ScrapedArticle[]> {
  const [arseblog, pia, espn, footballLondon, guardian, athletic] = await Promise.all([
    scrapeArseblog(),
    scrapePainInArsenal(),
    scrapeEspn(),
    scrapeFootballLondon(),
    scrapeGuardian(),
    scrapeAthletic(),
  ])

  return [...arseblog, ...pia, ...espn, ...footballLondon, ...guardian, ...athletic]
}
