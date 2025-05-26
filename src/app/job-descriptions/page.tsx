import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Building, Upload, FileText, TrendingUp } from "lucide-react"
import { UploadJobDescriptionModal } from "@/components/jobDescription/uploadJobDescriptionModal"
import { JobDescriptionsSkeleton } from "@/components/jobDescription/jobDescriptionSkeleton"
import { JobDescriptionsList } from "@/components/jobDescription/jobDescriptionList"

export default async function JobDescriptionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="absolute inset-0 opacity-20"></div>
        <div className="relative px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Job Descriptions 💼</h1>
                <p className="mt-4 text-xl text-teal-100 sm:text-2xl">
                  Organize and manage job descriptions for targeted interview practice
                </p>
                <p className="mt-2 text-lg text-teal-200">
                  Upload job postings to generate relevant interview questions
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <Building className="relative h-24 w-24 text-yellow-300" />
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
                  <p className="text-sm font-medium text-gray-600">Total Job Descriptions</p>
                  <p className="text-2xl font-bold text-teal-600">3</p>
                </div>
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-bold text-purple-600">3</p>
                </div>
                <Building className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Used in Interviews</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Job Descriptions List - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Job Descriptions</h2>
                <p className="text-gray-600">Manage job postings for targeted interview preparation</p>
              </div>
              <UploadJobDescriptionModal />
            </div>

            <Suspense fallback={<JobDescriptionsSkeleton />}>
              <JobDescriptionsList />
            </Suspense>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <h3 className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
                  <Upload className="h-5 w-5 text-teal-600" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <UploadJobDescriptionModal variant="sidebar" />
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Back to Dashboard</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Manage Resumes</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400">
              <CardContent className="p-6">
                <h3 className="text-gray-900 text-lg font-semibold mb-3">💡 Job Description Tips</h3>
                <ul className="text-gray-700 text-sm space-y-2">
                  <li>• Include complete job postings for better question generation</li>
                  <li>• Save multiple versions for different roles</li>
                  <li>• Focus on requirements and responsibilities sections</li>
                  <li>• Update descriptions when requirements change</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
