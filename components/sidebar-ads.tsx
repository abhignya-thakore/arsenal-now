"use client"

import { AdSlot } from "./ad-slot"

export function SidebarAds() {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""

  if (!adClient) return null

  return (
    <aside className="hidden lg:block w-72">
      <div className="sticky top-8 space-y-6">
        {/* Top Sidebar Ad */}
        <div className="bg-card border border-border rounded-sm p-5">
          <p className="text-xs text-muted-foreground mb-4 font-semibold uppercase tracking-wide">Advertisement</p>
          <AdSlot adSlot="1234567890" adClient={adClient} className="min-h-[600px]" />
        </div>

        {/* Bottom Sidebar Ad */}
        <div className="bg-card border border-border rounded-sm p-5">
          <p className="text-xs text-muted-foreground mb-4 font-semibold uppercase tracking-wide">Advertisement</p>
          <AdSlot adSlot="0987654321" adClient={adClient} className="min-h-[300px]" />
        </div>
      </div>
    </aside>
  )
}
