export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const urlSecret = new URL(request.url).searchParams.get("secret")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && urlSecret !== process.env.CRON_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER
    const yourPhone = process.env.YOUR_PHONE_NUMBER

    const message = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: yourPhone!,
        From: twilioPhone!,
        Body: "⚽ Time for today's Arsenal Weather Report! Reply with your 3-sentence summary of fan sentiment and your feelings.",
      }),
    })

    const result = await message.json()
    return Response.json({ success: true, messageSid: result.sid })
  } catch (error) {
    console.error("Error sending SMS reminder:", error)
    return Response.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
