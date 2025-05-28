
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Download, Eye, MoreHorizontal, Trash2, Star, Calendar, HardDrive, Upload } from "lucide-react"
import prisma from "@/config/prisma.config"
import { auth } from "@/auth"
import ResumePreviewButton, { ResumeActionDropdown } from "@/components/resumeClientSide"

export async function ResumesList() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized access. Please log in to view your resumes.")
  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

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
                      {resume.fileName}
                    </h3>
                    {false && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {resume.createdAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4" />
                      30KB
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">{resume.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <ResumePreviewButton
                  resumeKey={resume.fileName}
                  variant={"outline"}
                  size="sm"
                  className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                </ResumePreviewButton>
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
                    <ResumeActionDropdown resume={resume} />
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
