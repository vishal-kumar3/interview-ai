import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getInterviewFeedback, calculateSessionStats } from "@/actions/feedback.action"
import { FeedbackClient } from "@/components/feedback/FeedbackClient"
import { LoadingFeedback } from "@/components/feedback/LoadingFeedback"
import { ErrorFeedback } from "@/components/feedback/ErrorFeedback"

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const resolvedParams = await params
  const { session, error } = await getInterviewFeedback(resolvedParams.id)

  if (error) {
    if (error === "Unauthorized access") {
      redirect("/auth/login")
    }
    return <ErrorFeedback message={error} />
  }

  if (!session) {
    return <ErrorFeedback message="Interview session not found. Please return to the dashboard." />
  }

  // Generate overall feedback if it doesn't exist
  // if (!session.interviewFeedback && session.status === "COMPLETED") {
  //   const { feedback } = await generateOverallInterviewFeedback(resolvedParams.id)
  //   if (feedback) {
  //     session.interviewFeedback = feedback
  //   }
  // }

  const { averageScore, totalQuestions, answeredQuestions } = await calculateSessionStats(session.responses)

  return (
    <Suspense fallback={<LoadingFeedback />}>
      <FeedbackClient
        session={session}
        averageScore={averageScore}
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
      />
    </Suspense>
  )
}
