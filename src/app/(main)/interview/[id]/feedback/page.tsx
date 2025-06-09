import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getInterviewFeedback, calculateSessionStats } from "@/actions/feedback.action"
import { FeedbackClient } from "@/components/feedback/FeedbackClient"
import { LoadingFeedback } from "@/components/feedback/LoadingFeedback"
import { ErrorFeedback } from "@/components/feedback/ErrorFeedback"

interface ReviewPageProps {
  params: { id: string }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { session, error } = await getInterviewFeedback(params.id)

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
  //   const { feedback } = await generateOverallInterviewFeedback(params.id)
  //   if (feedback) {
  //     session.interviewFeedback = feedback
  //   }
  // }

  // Calculate session statistics
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

// Add metadata for better SEO
export async function generateMetadata({ params }: ReviewPageProps) {
  const { session } = await getInterviewFeedback(params.id)

  return {
    title: session ? `Interview Review - ${session.title}` : "Interview Review",
    description: "Review your interview performance and get detailed feedback on your responses."
  }
}
