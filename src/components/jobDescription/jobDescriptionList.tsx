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

export function JobDescriptionsList() {
  // Mock data - in real app, this would come from server
  const jobDescriptions = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      fileName: "senior-frontend-dev-techcorp.pdf",
      fileSize: 156789,
      uploadedAt: new Date("2024-01-12"),
      fileUrl: "/placeholder.pdf",
      description: "We are looking for a Senior Frontend Developer to join our dynamic team...",
      requirements: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
    {
      id: "2",
      title: "Product Manager",
      company: "StartupXYZ",
      fileName: "product-manager-startupxyz.pdf",
      fileSize: 203456,
      uploadedAt: new Date("2024-01-18"),
      fileUrl: "/placeholder.pdf",
      description: "Join our fast-growing startup as a Product Manager...",
      requirements: ["Product Strategy", "Analytics", "User Research", "Agile"],
    },
    {
      id: "3",
      title: "Data Scientist",
      company: "DataCorp Analytics",
      fileName: "data-scientist-datacorp.pdf",
      fileSize: 189234,
      uploadedAt: new Date("2024-01-22"),
      fileUrl: "/placeholder.pdf",
      description: "We're seeking a talented Data Scientist to drive insights...",
      requirements: ["Python", "Machine Learning", "SQL", "Statistics"],
    },
  ]

  const handleDelete = async (jobDescriptionId: string) => {
    try {
      const result = { success: true, message: "deleted" }
      if (result.success) {
        toast.success(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete job description")
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    toast.info(`Downloading ${fileName}...`)
  }

  const handlePreview = (fileUrl: string) => {
    toast.info("Opening preview...")
  }

  return (
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
                      {job.uploadedAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4" />
                      {formatFileSize(job.fileSize)}
                    </span>
                  </div>

                  {job.description && <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>}

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-gray-500" />
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500">{job.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(job.fileUrl)}
                  className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(job.fileUrl, job.fileName)}
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
                    <DropdownMenuItem onClick={() => handlePreview(job.fileUrl)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(job.fileUrl, job.fileName)}>
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
  )
}
