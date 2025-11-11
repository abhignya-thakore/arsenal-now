import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Invalid email address" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if already subscribed
    const { data: existing } = await supabase.from("newsletter_subscribers").select("*").eq("email", email).single()

    if (existing && existing.verified) {
      return Response.json({ error: "Already subscribed" }, { status: 400 })
    }

    // Insert or update subscriber
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .upsert({
        email,
        verified: true,
      })
      .select()
      .single()

    if (error) throw error

    // Send welcome email
    await resend.emails.send({
      from: "Arsenal News <noreply@arsenal-news.com>",
      to: email,
      subject: "Welcome to Arsenal News Aggregator",
      html: `
        <h2>Welcome to Arsenal News!</h2>
        <p>You've been subscribed to our daily Arsenal news digest.</p>
        <p>Every day at 9 AM UTC, you'll receive the latest Arsenal news from top sources including Arseblog, Pain in the Arsenal, The Athletic, ESPN, Football London, and The Guardian.</p>
        <p>Thank you for subscribing!</p>
      `,
    })

    return Response.json({ success: true, message: "Subscribed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return Response.json({ error: "Subscription failed" }, { status: 500 })
  }
}
