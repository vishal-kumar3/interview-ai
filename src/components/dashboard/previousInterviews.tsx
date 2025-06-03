"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Eye, Play, Trash2, MoreHorizontal, Filter, Calendar, Briefcase, Target, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { InterviewSession, InterviewStatus } from "@prisma/client"

// This would normally be a server component, but for demo purposes with interactions, making it client
export function PreviousInterviews({
  interviews
}: {
  interviews: InterviewSession[]
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")

  const handleDelete = async (sessionId: string) => {
    try {
      // const result = await deleteInterviewSession(sessionId)
      const result = { success: true, message: "Interview session deleted successfully" } // Mocked result for demo
      if (result.success) {
        toast.success(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete interview session")
    }
  }

  const handleResume = async (sessionId: string) => {
    try {
      // const result = await resumeInterviewSession(sessionId)
      const result = { success: true, redirectUrl: `/interview/${sessionId}/resume` } // Mocked result for demo
      if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl)
      }
    } catch (error) {
      toast.error("Failed to resume interview session")
    }
  }

  const getStatusBadge = (status: string, percentage: number) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "In Progress":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{percentage}% Complete</Badge>
      case "Not Started":
        return (
          <Badge variant="outline" className="text-gray-600">
            Not Started
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Technical":
        return <Target className="h-4 w-4 text-blue-600" />
      case "Behavioral":
        return <Briefcase className="h-4 w-4 text-green-600" />
      case "Situational":
        return <Calendar className="h-4 w-4 text-purple-600" />
      default:
        return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-600 bg-green-50"
      case "Intermediate":
        return "text-yellow-600 bg-yellow-50"
      case "Advanced":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("all")}>All Interviews</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>Completed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("in-progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("not-started")}>Not Started</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Interview Cards */}
      <div className="space-y-4">
        {interviews.map((interview) => (
          <Card
            key={interview.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-white to-gray-50 group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(interview.interviewType)}
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                      {interview.title}
                    </h3>
                    {getStatusBadge(interview.status, 50)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {interview.createdAt.toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(interview.difficulty)}`}
                    >
                      {interview.difficulty}
                    </span>
                    <span className="capitalize">{interview.interviewType}</span>
                  </div>

                  {interview.status === InterviewStatus.STARTED && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-teal-600">{50}%</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/interview/${interview.id}/details`)}
                    className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>

                  {interview.status !== InterviewStatus.COMPLETED && (
                    <Button
                      size="sm"
                      onClick={() => handleResume(interview.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {interview.status === InterviewStatus.ABANDONED ? "Start" : "Resume"}
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/interview/${interview.id}/details`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {interview.status !== InterviewStatus.COMPLETED && (
                        <DropdownMenuItem onClick={() => handleResume(interview.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </DropdownMenuItem>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Interview Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this interview session? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(interview.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {interviews.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first mock interview session.</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
