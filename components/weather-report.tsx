import { createClient } from "@/lib/supabase/server"

export async function WeatherReport() {
  const supabase = await createClient()

  const { data: report } = await supabase
    .from("weather_reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!report) {
    return null
  }

  const reportDate = new Date(report.report_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <section className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10 py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">☀️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Weather Report</h2>
            <p className="text-xs text-muted-foreground mb-4">{reportDate}</p>
            <p className="text-base leading-relaxed text-foreground">{report.content}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
