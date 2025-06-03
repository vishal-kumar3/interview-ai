import { redirect } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { getInterviewSession, generateInitialQuestions } from "@/actions/interview.actions"
import { InterviewHeader } from "@/components/interview/InterviewHeader"
import { QuestionCard } from "@/components/interview/QuestionCard"
import { InterviewClient } from "@/components/interview/InterviewClient"
import type { ExtendedInterview, StandardQuestion } from "@/types/interview.types"
import { auth } from "@/auth"
import { createInterviewChat, getExtendedInterviewById, pushInterviewQuestion } from "@/actions/interview.action"
import Link from "next/link"
import { InterviewStatus } from "@prisma/client"
import { aiQuestionSchema } from "@/schema/question.schema"

interface InterviewPageProps {
  params: { id: string }
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const authSession = await auth()

  if (!authSession || !authSession.user || !authSession.user.id) {
    return redirect("/auth/login")
  }

  const interviewData = await getExtendedInterviewById(params.id, authSession.user.id)

  if (interviewData.error || !interviewData.interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Interview session not found. Please return to the <Link href="/dashboard" className="italic underline">dashboard</Link>.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  let interview: ExtendedInterview = interviewData.interview
  let currentQuestion: StandardQuestion | null = null

  const interviewChat = await createInterviewChat(interview.sessionMetadata!)
  console.log("Chat created:", interviewChat)

  if (interview.questions.length === 0) {
    const initialQuestion = await interviewChat.sendMessage({
      message: "Please start the interview by generating initial questions.",
    })
    if (!initialQuestion || !initialQuestion.text) {
      throw new Error("Error while generating question, apply re-try here");
    }

    const { data, error } = aiQuestionSchema.safeParse(JSON.parse(initialQuestion.text))
    if (error) {
      throw new Error(`Invalid question format: ${error.message}`)
    }

    currentQuestion = await pushInterviewQuestion(params.id, data)
  }
  else {
    // check for unanswered questions
    const nextQuestionData = interview.questions.find(q => !q.response)
    if (nextQuestionData) {
      currentQuestion = {
        ...nextQuestionData,
      }
    }
    else {
      if (interview.status === InterviewStatus.COMPLETED) {
        // All questions answered, redirect to review
        redirect(`/interview/${params.id}/review`)
      }
      else {
        const nextQuestion = await interviewChat.sendMessage({
          message: "Please generate the next question for the interview.",
        })
        if (!nextQuestion || !nextQuestion.text) {
          throw new Error("Error while generating question, apply re-try here");
        }

        const { data, error } = aiQuestionSchema.safeParse(JSON.parse(nextQuestion.text))
        if (error) {
          throw new Error(`Invalid question format: ${error.message}`)
        }

        currentQuestion = await pushInterviewQuestion(params.id, data)
      }
    }
  }

  // Generate initial question if none exist
  // if (interview.questions.length === 0) {
  //   const questionResult = await generateInitialQuestions(params.id)

  //   if (questionResult.error || !questionResult.questions || questionResult.questions.length === 0) {
  //     redirect("/dashboard")
  //   }

  //   currentQuestion = {
  //     ...questionResult.questions[0],
  //     response: null
  //   }

  //   // Update interview with new questions
  //   interview = {
  //     ...interview,
  //     questions: questionResult.questions.map(q => ({
  //       ...q,
  //       response: null
  //     }))
  //   }
  // } else {
  //   // Find the next unanswered question
  //   const nextQuestionData = interview.questions.find(q => !q.response)
  //   if (nextQuestionData) {
  //     currentQuestion = {
  //       ...nextQuestionData,
  //       response: nextQuestionData.response || null
  //     }
  //   } else {
  //     // All questions answered, redirect to review
  //     redirect(`/interview/${params.id}/review`)
  //   }
  // }

  // if (!currentQuestion) {
  //   redirect("/dashboard")
  // }

  // const answeredQuestions = interview.questions.filter(q => q.response).length
  // const totalQuestions = interview.questions.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50">
      {/* <InterviewHeader
        interview={interview}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        isGeneratingNext={false}
      /> */}

      {/* Main Content */}
      {/* <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <QuestionCard question={currentQuestion} />

          <InterviewClient
            sessionId={params.id}
            initialSession={interview}
            initialQuestion={currentQuestion}
          />
        </div>
      </div> */}
    </div>
  )
}
