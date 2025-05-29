import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Briefcase, Target, TrendingUp } from "lucide-react"
import { DashboardStats } from "@/components/dashboard/dashboardStats"
import { CreateInterviewModal } from "@/components/dashboard/createInterview"
import { InterviewsSkeleton } from "@/components/dashboard/interviewSkeleton"
import { PreviousInterviews } from "@/components/dashboard/previousInterviews"
import { auth } from "@/auth"
import { getResumes } from "@/actions/resume.action"
import { getJobDescriptions } from "@/actions/jobDescription.action"

export default async function DashboardPage() {

  const session = await auth()

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
          <p className="mt-2 text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    )
  }

  const resumes = await getResumes(session.user.id)
  const jobDescriptions = await getJobDescriptions(session.user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Welcome back, { session?.user.username}! 👋
                </h1>
                <p className="mt-4 text-xl text-teal-100 sm:text-2xl">
                  Ace your next interview with AI-powered practice
                </p>
                <p className="mt-2 text-lg text-teal-200">
                  Master your skills for your dream job
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <TrendingUp className="relative h-24 w-24 text-yellow-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        {/* Dashboard Stats */}
        <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200 rounded-lg mb-8"></div>}>
          <DashboardStats />
        </Suspense>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Previous Interviews - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Previous Interviews</h2>
                <p className="text-gray-600">Review your practice sessions and track progress</p>
              </div>
              <CreateInterviewModal
                resumes={resumes.data ?? []}
                jobDescriptions={jobDescriptions.data ?? []}
              />
            </div>

            <Suspense fallback={<InterviewsSkeleton />}>
              <PreviousInterviews />
            </Suspense>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Target className="h-5 w-5 text-teal-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CreateInterviewModal
                  resumes={resumes.data ?? []}
                  jobDescriptions={jobDescriptions.data ?? []}
                  variant="sidebar"
                />
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/resumes">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Resumes
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/job-descriptions">
                    <Calendar className="h-4 w-4 mr-2" />
                    Job Descriptions
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 text-lg">💡 Pro Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Practice regularly with different interview types to build confidence.
                  Technical interviews benefit from coding practice, while behavioral
                  interviews improve with storytelling techniques.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
