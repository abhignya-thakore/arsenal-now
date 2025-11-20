// Football Data API integration for Arsenal fixtures and results

const FOOTBALL_API_URL = "https://api.football-data.org/v4"
const ARSENAL_TEAM_ID = 57 // Arsenal FC ID in football-data.org

interface Match {
  id: number
  homeTeam: {
    name: string
    crest: string
  }
  awayTeam: {
    name: string
    crest: string
  }
  score: {
    fullTime: {
      home: number | null
      away: number | null
    }
  }
  utcDate: string
  competition: {
    name: string
  }
  status: string
}

export async function getArsenalResults(limit = 5): Promise<Match[]> {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY

    const headers: HeadersInit = apiKey ? { "X-Auth-Token": apiKey } : {}

    const response = await fetch(
      `${FOOTBALL_API_URL}/teams/${ARSENAL_TEAM_ID}/matches?status=FINISHED&limit=${limit}`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!response.ok) {
      console.error("[v0] Football API error:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data.matches || []
  } catch (error) {
    console.error("[v0] Error fetching Arsenal results:", error)
    return []
  }
}

export async function getArsenalFixtures(limit = 5): Promise<Match[]> {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY

    const headers: HeadersInit = apiKey ? { "X-Auth-Token": apiKey } : {}

    const response = await fetch(
      `${FOOTBALL_API_URL}/teams/${ARSENAL_TEAM_ID}/matches?status=SCHEDULED&limit=${limit}`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!response.ok) {
      console.error("[v0] Football API error:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    return data.matches || []
  } catch (error) {
    console.error("[v0] Error fetching Arsenal fixtures:", error)
    return []
  }
}
