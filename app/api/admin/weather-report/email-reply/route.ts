import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Parse the incoming email from Resend webhook
    const fromEmail = payload.from
    const subject = payload.subject
    const text = payload.text || payload.html?.replace(/<[^>]*>/g, "") // Extract text content

    // Verify this is from the admin email
    const adminEmail = process.env.ADMIN_EMAIL || "your@email.com"
    if (!fromEmail || !fromEmail.includes(adminEmail.split("@")[0])) {
      return NextResponse.json({ error: "Unauthorized sender" }, { status: 401 })
    }

    // Extract weather report content (trim signature, quoted replies, etc.)
    let content = text.trim()

    // Remove common email signatures and quoted text
    content = content.split("On ")[0] // Remove "On [date]..." quoted replies
    content = content.split("--")[0] // Remove signatures starting with --
    content = content.split("___")[0] // Remove signatures starting with ___
    content = content.trim()

    if (!content || content.length < 10) {
      // Send error email
      await resend.emails.send({
        from: "ArsenalNow <noreply@arsenow.com>",
        to: adminEmail,
        subject: "Error: Weather Report Too Short",
        html: `<p>Your weather report was too short. Please reply with at least 3 sentences.</p>`,
      })
      return NextResponse.json({ error: "Content too short" }, { status: 400 })
    }

    // Save to database
    const supabase = await createClient()
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("weather_reports")
      .upsert(
        {
          report_date: today,
          content: content,
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
      // Send error email
      await resend.emails.send({
        from: "ArsenalNow <noreply@arsenow.com>",
        to: adminEmail,
        subject: "Error: Weather Report Failed to Save",
        html: `<p>There was an error saving your weather report: ${error.message}</p>`,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send confirmation email
    await resend.emails.send({
      from: "ArsenalNow <noreply@arsenow.com>",
      to: adminEmail,
      subject: "Success: Weather Report Posted!",
      html: `
        <h3>Your Arsenal Weather Report has been posted!</h3>
        <p><strong>Date:</strong> ${today}</p>
        <p><strong>Report:</strong></p>
        <p>${content}</p>
        <p>View it live at: <a href="https://arsenow.com">arsenow.com</a></p>
      `,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Email reply processing error:", error)
    return NextResponse.json({ error: "Failed to process email" }, { status: 500 })
  }
}
