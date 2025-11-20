import { Card } from "@/components/ui/card"

interface MatchCardProps {
  homeTeam: string
  awayTeam: string
  homeScore?: number | null
  awayScore?: number | null
  date: string
  competition: string
  isResult: boolean
}

export function MatchCard({ homeTeam, awayTeam, homeScore, awayScore, date, competition, isResult }: MatchCardProps) {
  const matchDate = new Date(date)
  const formattedDate = matchDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
  const formattedTime = matchDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const isArsenalHome = homeTeam === "Arsenal FC"
  const isArsenalAway = awayTeam === "Arsenal FC"

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        {/* Teams and Score */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isArsenalHome ? "text-foreground" : "text-muted-foreground"}`}>
              {homeTeam}
            </span>
            {isResult && homeScore !== null && homeScore !== undefined ? (
              <span className="text-lg font-bold">{homeScore}</span>
            ) : null}
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${isArsenalAway ? "text-foreground" : "text-muted-foreground"}`}>
              {awayTeam}
            </span>
            {isResult && awayScore !== null && awayScore !== undefined ? (
              <span className="text-lg font-bold">{awayScore}</span>
            ) : null}
          </div>
        </div>

        {/* Date and Competition */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{competition}</div>
          <div className="text-xs font-medium text-foreground mt-1">{formattedDate}</div>
          {!isResult && <div className="text-xs text-muted-foreground">{formattedTime}</div>}
        </div>
      </div>
    </Card>
  )
}
