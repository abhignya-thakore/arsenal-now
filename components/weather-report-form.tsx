"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface WeatherReportFormProps {
  existingReport: {
    id: string
    report_date: string
    content: string
  } | null
}

export function WeatherReportForm({ existingReport }: WeatherReportFormProps) {
  const [content, setContent] = useState(existingReport?.content || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/weather-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Weather report saved successfully!")
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage("Failed to save weather report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="content" className="block text-sm font-semibold text-foreground mb-3">
          Today's Weather Report
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your 3-sentence summary here..."
          className="min-h-[200px] text-base"
          required
        />
        <p className="text-xs text-muted-foreground mt-2">
          Character count: {content.length} | Sentences: {content.split(/[.!?]+/).filter((s) => s.trim()).length}
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto">
        {isSubmitting ? "Saving..." : existingReport ? "Update Report" : "Publish Report"}
      </Button>

      {message && (
        <p className={`text-sm ${message.includes("Error") ? "text-destructive" : "text-primary"}`}>{message}</p>
      )}
    </form>
  )
}
