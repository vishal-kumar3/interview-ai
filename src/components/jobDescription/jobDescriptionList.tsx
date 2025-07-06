"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Trash2, Calendar, Edit } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
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
          <JobDescriptionList
            key={job.id}
            job={job}
            handlePreview={handlePreview}
          />
        ))}

        {jobDescriptions.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job descriptions uploaded</h3>
              <p className="text-gray-600 mb-4">Upload job descriptions to generate targeted interview questions.</p>
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


const JobDescriptionList = ({
  job,
  handlePreview
}: {
    job: JobDescription,
    handlePreview: (job: JobDescription) => void
}) => {

  const [isDeleting, setIsDeleting] = useState(false)
  const handleDelete = async (jobDescriptionId: string) => {
    try {
      setIsDeleting(true)
      const result = await deleteJobDescription(jobDescriptionId)
      if (result.data) {
        toast.success(result.data)
      } else {
        toast.error(result.error || "Failed to delete job description")
      }
    } catch (error) {
      setIsDeleting(false)
      toast.error("Failed to delete job description")
    }
  }

  return (
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
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={async (e) => {
                e.preventDefault();
                await handleDelete(job.id);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {
                isDeleting ?
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  :
                  <Trash2 className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
