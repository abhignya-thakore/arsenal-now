import * as cheerio from "cheerio"

interface ScrapedArticle {
  title: string
  summary: string
  url: string
  publishedAt: Date
  source: string
}

// Arseblog scraper (HTML)
async function scrapeArseblog(): Promise<ScrapedArticle[]> {
  const articles: ScrapedArticle[] = []
  try {
    const response = await fetch("https://arseblog.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    const html = await response.text()
    const $ = cheerio.load(html)

    $("article")
      .slice(0, 3)
      .each((_, el) => {
        const titleEl = $(el).find("h2 a, h3 a").first()
        const title = titleEl.text().trim()
        const url = titleEl.attr("href")
        const excerpt = $(el).find("p").first().text().trim()
        const dateText = $(el).find("time").attr("datetime")

        if (title && url && excerpt) {
          articles.push({
            title,
            summary: excerpt.substring(0, 200),
            url: url.startsWith("http") ? url : `https://arseblog.com${url}`,
            publishedAt: new Date(dateText || new Date()),
            source: "Arseblog",
          })
        }
      })
  } catch (error) {
    console.error("Error scraping Arseblog:", error)
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
            summary: excerpt.substring(0, 200),
            url: url.startsWith("http") ? url : `https://www.paininthearsenal.com${url}`,
            publishedAt: new Date(dateText || new Date()),
            source: "Pain in the Arsenal",
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
    const response = await fetch("https://feeds.espn.com/feeds/site/espn/print/soccer/news.xml")
    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    $("item")
      .slice(0, 3)
      .each((_, el) => {
        const title = $(el).find("title").text().trim()
        const url = $(el).find("link").text().trim()
        const description = $(el).find("description").text().trim()
        const pubDate = $(el).find("pubDate").text().trim()

        if (title && url && title.toLowerCase().includes("arsenal")) {
          articles.push({
            title,
            summary: description.substring(0, 200).replace(/<[^>]*>/g, ""),
            url,
            publishedAt: new Date(pubDate || new Date()),
            source: "ESPN",
          })
        }
      })
  } catch (error) {
    console.error("Error scraping ESPN RSS:", error)
  }
  return articles
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
            summary: description.substring(0, 200).replace(/<[^>]*>/g, ""),
            url,
            publishedAt: new Date(pubDate || new Date()),
            source: "The Guardian",
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
            summary: description.substring(0, 200).replace(/<[^>]*>/g, ""),
            url,
            publishedAt: new Date(pubDate || new Date()),
            source: "Football London",
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
    // The Athletic public RSS feed
    const response = await fetch("https://theathletic.com/rss/feed/soccer/premier-league")
    const xml = await response.text()
    const $ = cheerio.load(xml, { xmlMode: true })

    $("item")
      .slice(0, 3)
      .each((_, el) => {
        const title = $(el).find("title").text().trim()
        const url = $(el).find("link").text().trim()
        const description = $(el).find("description").text().trim()
        const pubDate = $(el).find("pubDate").text().trim()

        if (title && url && title.toLowerCase().includes("arsenal")) {
          articles.push({
            title,
            summary: description.substring(0, 200).replace(/<[^>]*>/g, ""),
            url,
            publishedAt: new Date(pubDate || new Date()),
            source: "The Athletic",
          })
        }
      })
  } catch (error) {
    console.error("Error scraping The Athletic RSS:", error)
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
