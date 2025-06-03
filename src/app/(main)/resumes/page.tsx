import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Users, TrendingUp } from "lucide-react"
import { UploadResumeModal } from "@/components/resume/uploadResumeModal"
import { ResumesSkeleton } from "@/components/resume/resumeSkeleton"
import { ResumesList } from "@/components/resume/resumeList"
import Link from "next/link"

export default async function ResumesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Manage Your Resumes 📄</h1>
                <p className="mt-4 text-xl text-teal-100 sm:text-2xl">
                  Upload, organize, and optimize your resumes for different roles
                </p>
                <p className="mt-2 text-lg text-teal-200">Keep your professional profiles ready for any opportunity</p>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <FileText className="relative h-24 w-24 text-yellow-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-12">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-teal-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                  <p className="text-2xl font-bold text-teal-600">3</p>
                </div>
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Used in Interviews</p>
                  <p className="text-2xl font-bold text-green-600">5</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Resumes List - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Resumes</h2>
                <p className="text-gray-600">Manage and organize your professional profiles</p>
              </div>
              <UploadResumeModal />
            </div>

            <Suspense fallback={<ResumesSkeleton />}>
              <ResumesList />
            </Suspense>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Upload className="h-5 w-5 text-teal-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <UploadResumeModal variant="sidebar" />
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/job-descriptions">
                    <FileText className="h-4 w-4 mr-2" />
                    Job Descriptions
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400">
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 text-lg">💡 Resume Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• Tailor your resume for each role</li>
                  <li>• Use action verbs and quantify achievements</li>
                  <li>• Keep it concise (1-2 pages max)</li>
                  <li>• Include relevant keywords from job descriptions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
