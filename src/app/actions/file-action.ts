"use server"

import { auth } from "@/auth"
import prisma from "@/config/prisma.config"
import { extractTextFromPDF, parseResumeWithAi } from "@/utils/resumeParser"
import { saveFileToLocal, uploadFileToS3 } from "@/utils/uploadResume"
import { parseResume } from "@/utils/zodToJson"
import { revalidatePath } from "next/cache"

// Mock data types
type Resume = {
  id: string
  name: string
  fileName: string
  fileSize: number
  uploadedAt: Date
  fileUrl: string
  isDefault: boolean
}

type JobDescription = {
  id: string
  title: string
  company: string
  fileName: string
  fileSize: number
  uploadedAt: Date
  fileUrl: string
  description?: string
  requirements?: string[]
}

// Mock data
const mockResumes: Resume[] = [
  {
    id: "1",
    name: "John Doe Resume - Software Engineer",
    fileName: "john-doe-resume-swe.pdf",
    fileSize: 245760, // 240KB
    uploadedAt: new Date("2024-01-10"),
    fileUrl: "/placeholder.pdf",
    isDefault: true,
  },
  {
    id: "2",
    name: "John Doe Resume - Product Manager",
    fileName: "john-doe-resume-pm.pdf",
    fileSize: 198432, // 194KB
    uploadedAt: new Date("2024-01-15"),
    fileUrl: "/placeholder.pdf",
    isDefault: false,
  },
  {
    id: "3",
    name: "John Doe Resume - Data Scientist",
    fileName: "john-doe-resume-ds.pdf",
    fileSize: 267890, // 261KB
    uploadedAt: new Date("2024-01-20"),
    fileUrl: "/placeholder.pdf",
    isDefault: false,
  },
]

const mockJobDescriptions: JobDescription[] = [
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

export async function getResumes() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockResumes
}

export async function getJobDescriptions() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockJobDescriptions
}

export async function uploadResume(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const file = formData.get("file") as File
  const name = formData.get("name") as string
  const isDefault = formData.get("isDefault") === "true"

  // save to local
  const filePath = await saveFileToLocal(file)
  const text = await extractTextFromPDF(filePath)

  parseResume()
  // const uploadedUrl = await uploadFileToS3(filePath, name ?? file.name)
  // const resumeParseData = await parseResumeWithAi(text)
  // console.log("Parsed resume data:", resumeParseData)
  // const resume = await prisma.resume.create({
  //   data: {
  //     fileName: file.name,
  //     fileUrl: uploadedUrl,
  //   },
  // })

  revalidatePath("/resumes")
  return { success: true, message: "Resume uploaded successfully!" }
}

export async function uploadJobDescription(formData: FormData) {
  const file = formData.get("file") as File
  const title = formData.get("title") as string
  const company = formData.get("company") as string

  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log("Uploading job description:", { fileName: file.name, title, company })

  revalidatePath("/job-descriptions")
  return { success: true, message: "Job description uploaded successfully!" }
}

export async function deleteResume(resumeId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Deleting resume:", resumeId)
  revalidatePath("/resumes")
  return { success: true, message: "Resume deleted successfully!" }
}

export async function deleteJobDescription(jobDescriptionId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Deleting job description:", jobDescriptionId)
  revalidatePath("/job-descriptions")
  return { success: true, message: "Job description deleted successfully!" }
}

export async function setDefaultResume(resumeId: string) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  console.log("Setting default resume:", resumeId)
  revalidatePath("/resumes")
  return { success: true, message: "Default resume updated!" }
}
