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
import { FileText, Download, Eye, MoreHorizontal, Trash2, Star, Calendar, HardDrive, Upload } from "lucide-react"
import { toast } from "sonner"
import { deleteResume, setDefaultResume } from "@/app/actions/file-action"
import { formatFileSize } from "@/utils/formatFileSize"

export function ResumesList() {
  // Mock data - in real app, this would come from server
  const resumes = [
    {
      id: "1",
      name: "John Doe Resume - Software Engineer",
      fileName: "john-doe-resume-swe.pdf",
      fileSize: 245760,
      uploadedAt: new Date("2024-01-10"),
      fileUrl: "/placeholder.pdf",
      isDefault: true,
    },
    {
      id: "2",
      name: "John Doe Resume - Product Manager",
      fileName: "john-doe-resume-pm.pdf",
      fileSize: 198432,
      uploadedAt: new Date("2024-01-15"),
      fileUrl: "/placeholder.pdf",
      isDefault: false,
    },
    {
      id: "3",
      name: "John Doe Resume - Data Scientist",
      fileName: "john-doe-resume-ds.pdf",
      fileSize: 267890,
      uploadedAt: new Date("2024-01-20"),
      fileUrl: "/placeholder.pdf",
      isDefault: false,
    },
  ]

  const handleDelete = async (resumeId: string) => {
    try {
      const result = await deleteResume(resumeId)
      if (result.success) {
        toast.success(result.message)
      }
    } catch (error) {
      toast.error("Failed to delete resume")
    }
  }

  const handleSetDefault = async (resumeId: string) => {
    try {
      const result = await setDefaultResume(resumeId)
      if (result.success) {
        toast.success(result.message)
      }
    } catch (error) {
      toast.error("Failed to set default resume")
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    // In a real app, this would download from S3
    toast.info(`Downloading ${fileName}...`)
  }

  const handlePreview = (fileUrl: string) => {
    // In a real app, this would open a preview modal or new tab
    toast.info("Opening preview...")
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <Card
          key={resume.id}
          className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-white to-gray-50 group"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                  <FileText className="h-8 w-8 text-teal-600" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                      {resume.name}
                    </h3>
                    {resume.isDefault && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {resume.uploadedAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4" />
                      {formatFileSize(resume.fileSize)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">{resume.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(resume.fileUrl)}
                  className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(resume.fileUrl, resume.fileName)}
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
                    <DropdownMenuItem onClick={() => handlePreview(resume.fileUrl)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(resume.fileUrl, resume.fileName)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    {!resume.isDefault && (
                      <DropdownMenuItem onClick={() => handleSetDefault(resume.id)}>
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
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
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete `&quot;`{resume.name}`&quot;`? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(resume.id)}
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

      {resumes.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes uploaded</h3>
            <p className="text-gray-600 mb-4">Upload your first resume to get started with mock interviews.</p>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
