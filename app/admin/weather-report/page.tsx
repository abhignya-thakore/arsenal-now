import { createClient } from "@/lib/supabase/server"
import { WeatherReportForm } from "@/components/weather-report-form"

export default async function AdminWeatherReportPage() {
  const supabase = await createClient()

  // Get today's report if it exists
  const today = new Date().toISOString().split("T")[0]
  const { data: todayReport } = await supabase.from("weather_reports").select("*").eq("report_date", today).single()

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Weather Report Admin</h1>
          <p className="text-muted-foreground">
            Write your daily 3-sentence summary of fan sentiment and your feelings about Arsenal
          </p>
        </div>

        <WeatherReportForm existingReport={todayReport} />

        <div className="mt-12 p-6 border border-border rounded-sm bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground mb-3">Guidelines:</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Keep it to exactly 3 sentences</li>
            <li>• Include fan sentiment from social media, forums, etc.</li>
            <li>• Add your personal feelings and analysis</li>
            <li>• Update daily for fresh original content</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
