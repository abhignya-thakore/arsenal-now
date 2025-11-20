"use client"

import { useEffect } from "react"

interface AdSlotProps {
  adSlot: string
  adClient: string
  className?: string
}

export function AdSlot({ adSlot, adClient, className = "" }: AdSlotProps) {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      // Silently fail if AdSense not loaded yet
    }
  }, [])

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
