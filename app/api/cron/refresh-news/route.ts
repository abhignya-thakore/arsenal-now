import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Cron endpoint is working - no auth required!',
    timestamp: new Date().toISOString()
  })
}
