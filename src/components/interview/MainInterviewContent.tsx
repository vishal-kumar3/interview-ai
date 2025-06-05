"use client"
import { InterviewClient } from "@/components/interview/InterviewClient"
import { QuestionCard } from "@/components/interview/QuestionCard"
import { ExtendedInterview, StandardQuestion } from "@/types/interview.types"
import { Chat } from "@google/genai"
import { useEffect, useState } from "react"
import { aiQuestionSchema, GeminiQuestionUnionSchema } from "@/schema/question.schema"
import { pushInterviewQuestion, createInterviewChat } from "@/actions/interview.action"
import { InterviewStatus, SessionMetadata } from "@prisma/client"
import { useRouter } from "next/navigation"
import { createGenAIChat, GeminiHistoryType } from "@/config/gemini.config"
import { generateInitialQuestion, nextQuestion } from "@/actions/chat.action"


interface MainInterviewContentProps {
  interview: ExtendedInterview
}

const MainInterviewContent = ({
  interview,
}: MainInterviewContentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState<StandardQuestion | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const setUnansweredQuestion = () => {
    const nextQuestionData = interview.questions.find(q => !q.response)
    if (nextQuestionData) {
      setCurrentQuestion({
        ...nextQuestionData,
      })
      return true
    }
    return false
  }

  const generateNextQuestion = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      if (interview.status === InterviewStatus.COMPLETED) {
        router.push(`/interview/${interview.id}/review`)
        return
      }

      const { data, error } = await nextQuestion(interview.id)
      if (error) {
        return setError(error)
      }

      setCurrentQuestion(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate next question")
    } finally {
      setIsGenerating(false)
    }
  }


  // generate initial question or set unanswered questions.
  useEffect(() => {
    const initializeQuestion = async () => {
      if (interview.questions.length === 0) {
        const { data, error } = await generateInitialQuestion(interview.id)
        if (error) {
          return setError(error)
        }
        setCurrentQuestion(data)
      } else {
        const hasUnanswered = setUnansweredQuestion()
        if (!hasUnanswered && interview.status !== InterviewStatus.COMPLETED) {
          await generateNextQuestion()
        } else if (!hasUnanswered && interview.status === InterviewStatus.COMPLETED) {
          router.push(`/interview/${interview.id}/review`)
        }
      }
    }

    initializeQuestion()
  }, [])

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <p className="text-gray-500">No questions available. Please wait while we generate the first question.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <QuestionCard
        question={currentQuestion}
        // isGenerating={isGenerating}
      />

      <InterviewClient
        sessionId={interview.id}
        initialSession={interview}
        initialQuestion={currentQuestion}
        // onNextQuestion={onNextQuestion}
        // isGeneratingNext={isGenerating}
      />
    </div>
  )
}

export default MainInterviewContent
