import { createClient } from "@/lib/supabase/server"

interface TldrInlineProps {
  date: string
}

export async function TldrInline({ date }: TldrInlineProps) {
  const supabase = await createClient()

  // Convert display date to YYYY-MM-DD format
  const reportDate = new Date(date).toISOString().split("T")[0]

  const { data: report } = await supabase.from("tldr_reports").select("*").eq("report_date", reportDate).maybeSingle()

  if (!report) {
    return null
  }

  return (
    <div className="mb-12 border-4 border-accent bg-accent/10 p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
      <h3 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tight flex items-center gap-3">
        <span className="text-accent">•</span> TLDR;
      </h3>
      <div className="text-foreground leading-relaxed font-medium text-base space-y-2">
        {report.content
          .split("\n")
          .map((sentence: string, idx: number) => sentence.trim() && <p key={idx}>{sentence.trim()}</p>)}
      </div>
    </div>
  )
}
