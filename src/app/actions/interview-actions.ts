"use server"

import { revalidatePath } from "next/cache"

// Mock data types (replace with your actual Prisma types)
type InterviewSession = {
  id: string
  jobTitle: string
  interviewType: "Technical" | "Behavioral" | "Situational"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  status: "Completed" | "In Progress" | "Not Started"
  createdAt: Date
  completionPercentage: number
  jobDescriptionId: string
  resumeId: string
}

type JobDescription = {
  id: string
  title: string
  company: string
  fileName: string
}

type Resume = {
  id: string
  name: string
  fileName: string
}

// Mock data - replace with actual Prisma queries
const mockInterviews: InterviewSession[] = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    interviewType: "Technical",
    difficulty: "Advanced",
    status: "Completed",
    createdAt: new Date("2024-01-15"),
    completionPercentage: 100,
    jobDescriptionId: "1",
    resumeId: "1",
  },
  {
    id: "2",
    jobTitle: "Product Manager",
    interviewType: "Behavioral",
    difficulty: "Intermediate",
    status: "In Progress",
    createdAt: new Date("2024-01-20"),
    completionPercentage: 60,
    jobDescriptionId: "2",
    resumeId: "1",
  },
  {
    id: "3",
    jobTitle: "Data Scientist",
    interviewType: "Technical",
    difficulty: "Advanced",
    status: "Not Started",
    createdAt: new Date("2024-01-22"),
    completionPercentage: 0,
    jobDescriptionId: "3",
    resumeId: "2",
  },
]

const mockJobDescriptions: JobDescription[] = [
  { id: "1", title: "Senior Frontend Developer", company: "TechCorp", fileName: "frontend-dev.pdf" },
  { id: "2", title: "Product Manager", company: "StartupXYZ", fileName: "pm-role.pdf" },
  { id: "3", title: "Data Scientist", company: "DataCorp", fileName: "data-scientist.pdf" },
]

const mockResumes: Resume[] = [
  { id: "1", name: "John Doe Resume", fileName: "john-doe-resume.pdf" },
  { id: "2", name: "John Doe Resume (Updated)", fileName: "john-doe-resume-v2.pdf" },
]

export async function getInterviewSessions() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockInterviews
}

export async function getJobDescriptions() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockJobDescriptions
}

export async function getResumes() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockResumes
}

export async function createInterviewSession(formData: FormData) {
  const jobDescriptionId = formData.get("jobDescriptionId") as string
  const resumeId = formData.get("resumeId") as string
  const interviewType = formData.get("interviewType") as "Technical" | "Behavioral" | "Situational"
  const difficulty = formData.get("difficulty") as "Beginner" | "Intermediate" | "Advanced"
  const notes = formData.get("notes") as string

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Here you would:
  // 1. Upload files to S3 if new files were provided
  // 2. Parse job description and resume using AI
  // 3. Create new InterviewSession in database
  // 4. Generate initial questions

  console.log("Creating interview session:", {
    jobDescriptionId,
    resumeId,
    interviewType,
    difficulty,
    notes,
  })

  revalidatePath("/dashboard")
  return { success: true, message: "Interview session created successfully!" }
}

export async function deleteInterviewSession(sessionId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Here you would delete from database
  console.log("Deleting interview session:", sessionId)

  revalidatePath("/dashboard")
  return { success: true, message: "Interview session deleted successfully!" }
}

export async function resumeInterviewSession(sessionId: string) {
  // Redirect logic would be handled in the component
  return { success: true, redirectUrl: `/interview/${sessionId}` }
}
