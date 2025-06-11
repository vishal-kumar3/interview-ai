"use client"

import { useState } from "react"
import { useSecurity } from "@/hooks/use-security"
import { ResponseForm } from "./ResponseForm"
import { LoadingIndicator } from "./LoadingIndicator"
import { EndInterviewDialog } from "./EndInterviewDialog"
import type { ExtendedInterview, StandardQuestion } from "@/types/interview.types"
import { AudioRecording } from "@/hooks/use-audio-recorder"
import { submitInterviewResponse } from "@/actions/chat.action"

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
      console.log(`Malpractice detected: ${type}`)
    },
    onTerminate: () => {
      // terminateSession()
      console.log("Session terminated due to malpractice")
    },
  })

  const handleEndInterview = () => {
    setShowEndDialog(true)
  }

  const confirmEndInterview = async () => {
    setShowEndDialog(false)
    // await endInterview()
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

      {closingStatement && (
        <div className="closing-statement">
          <h2>Closing Statement</h2>
          <p>{closingStatement}</p>
        </div>
      )}

      <EndInterviewDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={confirmEndInterview}
      />
    </>
  )
}
