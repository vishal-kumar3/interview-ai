"use client"

import { useState } from "react"
import { useSecurity } from "@/hooks/use-security"
import { useInterview } from "@/hooks/useInterview"
import { ResponseForm } from "./ResponseForm"
import { LoadingIndicator } from "./LoadingIndicator"
import { FeedbackCard } from "./FeedbackCard"
import { EndInterviewDialog } from "./EndInterviewDialog"
import type { ExtendedInterview, StandardQuestion } from "@/types/interview.types"

interface InterviewClientProps {
  sessionId: string
  initialSession: ExtendedInterview
  initialQuestion: StandardQuestion
}

export function InterviewClient({
  sessionId,
  initialSession,
  initialQuestion
}: InterviewClientProps) {
  const [showEndDialog, setShowEndDialog] = useState(false)

  // Security hook
  const { malpracticeCount } = useSecurity({
    sessionId: sessionId,
    onMalpractice: (type) => {
      console.log(`Malpractice detected: ${type}`)
    },
    onTerminate: () => {
      // terminateSession()
    },
  })

  // Interview logic hook
  const {
    interview,
    currentQuestion,
    showFeedback,
    currentFeedback,
    isSubmitting,
    isGeneratingNext,
    submitResponse,
    endInterview,
  } = useInterview(sessionId, initialSession, initialQuestion)

  const handleEndInterview = () => {
    setShowEndDialog(true)
  }

  const confirmEndInterview = async () => {
    setShowEndDialog(false)
    await endInterview()
  }

  return (
    <>
      {!showFeedback && !isGeneratingNext && (
        <ResponseForm
          isSubmitting={isSubmitting}
          onSubmitResponse={submitResponse}
          onEndInterview={handleEndInterview}
        />
      )}

      {isGeneratingNext && <LoadingIndicator />}

      {showFeedback && currentFeedback && (
        <FeedbackCard feedback={currentFeedback} />
      )}

      <EndInterviewDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        onConfirm={confirmEndInterview}
      />
    </>
  )
}
