"use server"
import { redirect } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { InterviewHeader } from "@/components/interview/InterviewHeader"
import type { ExtendedInterview } from "@/types/interview.types"
import { auth } from "@/auth"
import { createInterviewChat, getExtendedInterviewById, pushInterviewQuestion } from "@/actions/interview.action"
import Link from "next/link"
import MainInterviewContent from "@/components/interview/MainInterviewContent"
import { createCacheKey, redisCache, RedisCachePrefix } from "@/config/redis.config"

interface InterviewPageProps {
  params: Promise<{ id: string }>
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const authSession = await auth()
  const searchParams = await params

  if (!authSession || !authSession.user || !authSession.user.id) {
    return redirect("/auth/login")
  }

  const interviewData = await getExtendedInterviewById(searchParams.id, authSession.user.id)

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

  const interview: ExtendedInterview = interviewData.interview

  const redisInterviewChatExists = await redisCache.exists(createCacheKey(RedisCachePrefix.INTERVIEW, interview.id))
  if (!redisInterviewChatExists) {
    const chat = await createInterviewChat(interview.sessionMetadata!)
    redisCache.set(
      createCacheKey(RedisCachePrefix.INTERVIEW, interview.id),
      chat
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50">
      <InterviewHeader interview={interview} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <MainInterviewContent
          interview={interview}
          // submitResponse={submitResponse}
        />
      </div>
    </div>
  )
}
