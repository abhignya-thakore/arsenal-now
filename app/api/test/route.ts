export async function GET() {
  return Response.json({
    message: "Test endpoint works!",
    timestamp: new Date().toISOString(),
    cronSecret: process.env.CRON_SECRET ? "exists" : "missing",
  })
}
