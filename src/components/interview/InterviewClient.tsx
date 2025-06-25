"use client"

import { useState } from "react"
import { useSecurity } from "@/hooks/use-security"
import { ResponseForm } from "./ResponseForm"
import { LoadingIndicator } from "./LoadingIndicator"
import { EndInterviewDialog } from "./EndInterviewDialog"
import type { ExtendedInterview, StandardQuestion } from "@/types/interview.types"
import { AudioRecording } from "@/hooks/use-audio-recorder"
import { submitInterviewResponse } from "@/actions/chat.action"
import { endInterviewSession } from "@/actions/interview.action"
import Link from "next/link"

interface InterviewClientProps {
  sessionId: string
  currentSession: ExtendedInterview
  currentQuestion: StandardQuestion
  generateNextQuestion: () => Promise<void>
  setQuestion: (question: StandardQuestion | null) => void
}

export function InterviewClient({
  sessionId,
  currentSession,
  currentQuestion,
  setQuestion,
}: InterviewClientProps) {
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [isGeneratingNext, setIsGeneratingNext] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [closingStatement, setClosingStatement] = useState<string | null>(null)

  // Security hook
  const { malpracticeCount } = useSecurity({
    sessionId: sessionId,
    onMalpractice: (type) => {
    },
    onTerminate: () => {
      // terminateSession()
    },
  })

  const handleEndInterview = () => {
    setShowEndDialog(true)
  }

  const confirmEndInterview = async () => {
    setShowEndDialog(false)
    const { data, error } = await endInterviewSession(sessionId)
    if (!data || error) {
      console.error("Error ending interview session:", error)
      return
    }
    setClosingStatement("Thank you for participating in the interview.")

  }

  const submitResponse = async (textResponse: string, audioResponse?: { audio: AudioRecording, filePath: string }) => {
    setIsSubmitting(true)
    setIsGeneratingNext(true)
    const { error, question, closing } = await submitInterviewResponse(
      sessionId,
      currentQuestion.id,
      audioResponse ? "audio" : "text",
      textResponse,
      audioResponse && {
        filePath: audioResponse?.filePath,
        duration: audioResponse?.audio.duration,
        fileType: audioResponse?.audio.blob.type
      }
    )

    if (error) {
      console.error("Error submitting response:", error)
    }
    else if (question) {
      setQuestion(question)
    }
    else {
      setQuestion(null)
      setClosingStatement(closing)
    }

    setIsSubmitting(false)
    setIsGeneratingNext(false)
  }

  return (
    <>
      {
        closingStatement ? (
          <div className="text-center mt-10">
            <h2 className="text-2xl font-semibold mb-4">Interview Completed</h2>
            <p className="text-gray-600 mb-6">{closingStatement}</p>
            <Link href={`/interview/${sessionId}/feedback`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Feedback Page
            </Link>
          </div>
        ): (
            <>
              {!isGeneratingNext && (
                <ResponseForm
                  interviewId={currentSession.id}
                  questionId={currentQuestion.id}
                  isSubmitting={isSubmitting}
                  onSubmitResponse={submitResponse}
                  onEndInterview={handleEndInterview}
                />
              )}

              {isGeneratingNext && <LoadingIndicator />}

              <EndInterviewDialog
                open={showEndDialog}
                onOpenChange={setShowEndDialog}
                onConfirm={confirmEndInterview}
              />
          </>
        )
      }

    </>
  )
}
