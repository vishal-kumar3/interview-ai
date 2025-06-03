"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Feedback } from "@prisma/client"
import { AudioRecording } from "@/hooks/use-audio-recorder"
import {
  submitResponseAndGetNext,
  endInterviewEarly
} from "@/actions/interview.actions"
import type { ExtendedInterview, StandardQuestion } from "@/types/interview.types"

export function useInterview(
  sessionId: string,
  initialSession?: ExtendedInterview,
  initialQuestion?: StandardQuestion
) {
  const router = useRouter()
  const [interview, setInterview] = useState<ExtendedInterview | null>(initialSession || null)
  const [currentQuestion, setCurrentQuestion] = useState<StandardQuestion | null>(initialQuestion || null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingNext, setIsGeneratingNext] = useState(false)
  const [aiReasoning, setAiReasoning] = useState<string>("")

  const submitResponse = async (data: { response: string }, audioRecording?: AudioRecording) => {
    if (!interview || !currentQuestion) return

    const hasTextResponse = data.response.trim()
    const hasAudioResponse = audioRecording

    if (!hasTextResponse && !hasAudioResponse) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitResponseAndGetNext(sessionId, currentQuestion.id, {
        content: data.response || "[Audio Response]",
        responseType: audioRecording ? "audio" : "text",
        fileUrl: audioRecording?.url,
        duration: audioRecording?.duration
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.feedback) {
        setCurrentFeedback(result.feedback)
        setShowFeedback(true)
        setAiReasoning(result.reasoning || "Processing your response...")
      }

      if (result.shouldEnd) {
        setTimeout(() => {
          router.push(`/interview/${sessionId}/review`)
        }, 3000)
      } else if (result.nextQuestion) {
        setIsGeneratingNext(true)
        setAiReasoning(result.reasoning || "Generating next question based on your response...")

        setTimeout(() => {
          const nextQuestion: StandardQuestion = {
            ...result.nextQuestion!,
            response: null
          }

          setCurrentQuestion(nextQuestion)
          setShowFeedback(false)
          setIsGeneratingNext(false)

          setInterview(prev => prev ? {
            ...prev,
            questions: [...prev.questions, {
              ...result.nextQuestion!,
              response: null
            }]
          } : null)
        }, 3000)
      }

    } catch (error) {
      console.error("Failed to submit response:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const endInterview = async () => {
    const result = await endInterviewEarly(sessionId)

    if (result.error) {
      return
    }

    router.push(`/interview/${sessionId}/review`)
  }

  return {
    interview,
    currentQuestion,
    showFeedback,
    currentFeedback,
    isSubmitting,
    isGeneratingNext,
    aiReasoning,
    submitResponse,
    endInterview,
  }
}
