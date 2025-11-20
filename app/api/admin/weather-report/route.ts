import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]

    // Upsert (insert or update) today's report
    const { data, error } = await supabase
      .from("weather_reports")
      .upsert(
        {
          report_date: today,
          content: content.trim(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "report_date",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Weather report save error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Weather report API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
