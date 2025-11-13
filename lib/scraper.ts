import * as cheerio from "cheerio"
import { generateText } from "ai"

interface ScrapedArticle {
  title: string
  summary: string
  url: string
  publishedAt: Date
  source: string
  sourceUrl: string
}

async function generateAISummary(title: string, description: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Generate a single, engaging sentence (maximum 20 words) summarizing this Arsenal FC news article:

Title: ${title}
Description: ${description}

Summary:`,
      maxTokens: 50,
    })

    return text.trim()
  } catch (error) {
    console.error("[v0] Error generating AI summary:", error)
    // Fallback to first sentence if AI fails
    return extractFirstSentence(description)
  }
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

    const itemsArray = items.slice(0, 3).toArray()
    for (const el of itemsArray) {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      if (title && url) {
        const summary = await generateAISummary(title, description)

        articles.push({
          title,
          summary,
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "Arseblog",
          sourceUrl: "https://arseblog.com",
        })
      }
    }

    console.log(`[v0] Arseblog parsed ${articles.length} articles`)
  } catch (error) {
    console.error("[v0] Error scraping Arseblog RSS:", error)
  }
  return articles
}

// Pain in the Arsenal scraper (RSS)
async function scrapePainInArsenal(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://paininthearsenal.com/feed", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Pain in the Arsenal RSS HTTP error: ${response.status}`)
      return articles
    }

    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const items = $("item")
    console.log(`[v0] Pain in the Arsenal RSS found ${items.length} items`)

    const itemsArray = items.slice(0, 3).toArray()
    for (const el of itemsArray) {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      if (title && url) {
        const summary = await generateAISummary(title, description)

        articles.push({
          title,
          summary,
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "Pain in the Arsenal",
          sourceUrl: "https://paininthearsenal.com",
        })
      }
    }

    console.log(`[v0] Pain in the Arsenal parsed ${articles.length} articles`)
  } catch (error) {
    console.error("[v0] Error scraping Pain in the Arsenal RSS:", error)
  }
  return articles
}

async function scrapeEspn(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
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

    const arsenalItems: cheerio.Element[] = []
    items.each((_, el) => {
      const title = $(el).find("title").text().trim()
      if (title && title.toLowerCase().includes("arsenal")) {
        arsenalItems.push(el)
      }
    })

    for (const el of arsenalItems.slice(0, 3)) {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      if (title && url) {
        const summary = await generateAISummary(title, description)

        articles.push({
          title,
          summary,
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "ESPN",
          sourceUrl: "https://www.espn.com",
        })
      }
    }

    console.log(`[v0] ESPN found ${articles.length} Arsenal articles`)
  } catch (error) {
    console.error("[v0] Error scraping ESPN RSS:", error)
  }
  return articles
}

async function scrapeGuardian(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://www.theguardian.com/football/arsenal/rss")
    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    const itemsArray = $("item").slice(0, 3).toArray()
    for (const el of itemsArray) {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      if (title && url) {
        const summary = await generateAISummary(title, description)

        articles.push({
          title,
          summary,
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "The Guardian",
          sourceUrl: "https://www.theguardian.com",
        })
      }
    }
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

    const itemsArray = $("item").slice(0, 3).toArray()
    for (const el of itemsArray) {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      if (title && url) {
        const summary = await generateAISummary(title, description)

        articles.push({
          title,
          summary,
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "Football London",
          sourceUrl: "https://www.football.london",
        })
      }
    }
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

    const arsenalItems: cheerio.Element[] = []
    items.each((_, el) => {
      const title = $(el).find("title").text().trim()
      if (title && title.toLowerCase().includes("arsenal")) {
        arsenalItems.push(el)
      }
    })

    for (const el of arsenalItems.slice(0, 3)) {
      const title = $(el).find("title").text().trim()
      const url = $(el).find("link").text().trim()
      const description = $(el).find("description").text().trim()
      const pubDate = $(el).find("pubDate").text().trim()

      if (title && url) {
        const summary = await generateAISummary(title, description)

        articles.push({
          title,
          summary,
          url,
          publishedAt: new Date(pubDate || new Date()),
          source: "The Athletic",
          sourceUrl: "https://theathletic.com",
        })
      }
    }

    console.log(`[v0] The Athletic found ${articles.length} Arsenal articles`)
  } catch (error) {
    console.error("[v0] Error scraping The Athletic RSS:", error)
  }
  return articles
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
