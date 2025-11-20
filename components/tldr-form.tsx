"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface TldrFormProps {
  existingReport?: {
    content: string
  } | null
}

export function TldrForm({ existingReport }: TldrFormProps) {
  const [content, setContent] = useState(existingReport?.content || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const sentenceCount = sentences.length
  const charCount = content.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/tldr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "TLDR saved successfully!" })
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save TLDR" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your 5-sentence TLDR summary here..."
          className="min-h-[200px] text-base"
          required
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>
            Sentences:{" "}
            <span className={sentenceCount === 5 ? "text-green-600 font-semibold" : ""}>{sentenceCount}</span> / 5
          </span>
          <span>Characters: {charCount}</span>
        </div>
        {sentenceCount !== 5 && content.length > 0 && (
          <p className="text-sm text-amber-600 mt-2">Please write exactly 5 sentences for your TLDR.</p>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting || sentenceCount !== 5} className="w-full">
        {isSubmitting ? "Saving..." : existingReport ? "Update TLDR" : "Save TLDR"}
      </Button>
    </form>
  )
}
