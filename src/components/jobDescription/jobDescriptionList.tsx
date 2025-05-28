"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Building, Download, Eye, MoreHorizontal, Trash2, Calendar, HardDrive, Upload, Tag } from "lucide-react"
import { toast } from "sonner"
import { formatFileSize } from "@/utils/formatFileSize"
import { auth } from "@/auth"
import { use, useState } from "react"
import prisma from "@/config/prisma.config"
import { JobDescription } from "@prisma/client"
import { deleteJobDescription } from "@/actions/jobDescription.action"
import { JobDescriptionPreviewModal } from "./jobDescriptionPreviewModal"

export function JobDescriptionsList(
  { jobDescriptions }:
    {
      jobDescriptions: JobDescription[]
    }) {

  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleDelete = async (jobDescriptionId: string) => {
    try {
      const result = await deleteJobDescription(jobDescriptionId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || "Failed to delete job description")
      }
    } catch (error) {
      toast.error("Failed to delete job description")
    }
  }

  const handlePreview = (job: JobDescription) => {
    setSelectedJob(job)
    setIsPreviewOpen(true)
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setSelectedJob(null)
  }

  return (
    <>
      <div className="space-y-4">
        {jobDescriptions.map((job) => (
          <Card
            key={job.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-white to-gray-50 group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-purple-600 font-medium">{job.company}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {job.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                    onClick={() => handlePreview(job)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(job)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job Description</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete `&quot;`{job.title}`&quot;` from {job.company}? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(job.id)}
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

        {jobDescriptions.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job descriptions uploaded</h3>
              <p className="text-gray-600 mb-4">Upload job descriptions to generate targeted interview questions.</p>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Job Description
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedJob && (
        <JobDescriptionPreviewModal
          jobDescription={selectedJob}
          isOpen={isPreviewOpen}
          onClose={closePreview}
        />
      )}
    </>
  )
}
