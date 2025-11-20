import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    const urlParams = new URL(request.url).searchParams
    const secret = authHeader?.replace("Bearer ", "") || urlParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Send daily reminder email
    const { data, error } = await resend.emails.send({
      from: "ArsenalNow <noreply@arsenow.com>",
      to: process.env.ADMIN_EMAIL || "your@email.com",
      subject: "Arsenal Weather Report - Daily Reminder",
      replyTo: "weather-report@oldalni.resend.app",
      html: `
        <h2>Time to write your Arsenal Weather Report!</h2>
        <p>Simply reply to this email with your 3-sentence summary of fan sentiment and your feelings about Arsenal.</p>
        <p>Your report will automatically be posted to ArsenalNow.</p>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Alternatively, you can post directly at: https://arsenow.com/admin/weather-report
        </p>
      `,
    })

    if (error) {
      console.error("[v0] Failed to send reminder email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Email reminder error:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
