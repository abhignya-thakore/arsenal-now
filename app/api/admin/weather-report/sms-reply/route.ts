import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const from = formData.get("From") as string
    const body = formData.get("Body") as string

    // Verify it's from your phone number
    if (from !== process.env.YOUR_PHONE_NUMBER) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Clean up the message
    const report = body.trim()

    // Save to database
    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]

    const { error } = await supabase.from("weather_reports").upsert(
      {
        date: today,
        report: report,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "date",
      },
    )

    if (error) {
      console.error("Error saving weather report:", error)
      // Send error response via TwiML
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error saving report. Please try again.</Message></Response>`,
        { headers: { "Content-Type": "text/xml" } },
      )
    }

    // Send success confirmation via TwiML
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>✅ Weather Report saved! It's now live on ArsenalNow.</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } },
    )
  } catch (error) {
    console.error("Error processing SMS:", error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error processing your message.</Message></Response>`,
      { headers: { "Content-Type": "text/xml" } },
    )
  }
}
