"use server"

import { auth } from "@/auth"
import { createGenAIText } from "@/config/gemini.config"
import prisma from "@/config/prisma.config"
import { jobDescriptionGeneratePrompt, jobDescriptionParserPrompt } from "@/lib/prompt"
import { JobDescriptionParseJsonSchema, jobDescriptionResponseSchema } from "@/schema/jobDescription.schema"
import { extractTextFromPDF } from "@/utils/PDFParser"
import { saveFileToLocal } from "@/utils/upload"
import { revalidatePath } from "next/cache"


export const getJobDescriptions = async (userId?: string) => {
  if (!userId) {
    const session = await auth()
    if (!session?.user) {
      return {
        error: "Unauthorized access. Please log in to view your job descriptions.",
        data: null,
      }
    }
    userId = session.user.id!
  }
  const jobDescriptions = await prisma.jobDescription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
  return {
    data: jobDescriptions,
    error: null,
  }
}

export const updateJobDescription = async (jobDescriptionId: string, data: any) => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: "Unauthenticated",
      data: null,
    }
  }

  const jobDescription = await prisma.jobDescription.findUnique({
    where: {
      id: jobDescriptionId,
    },
  })
  if (!jobDescription) {
    return {
      error: "Job Description not found",
      data: null,
    }
  }

  if (jobDescription.userId !== session.user.id) {
    return {
      error: "Unauthorized",
      data: null,
    }
  }

  const updatedJobDescription = await prisma.jobDescription.update({
    where: {
      id: jobDescriptionId,
      userId: session.user.id,
    },
    data: {
      title: data.title || jobDescription.title,
      company: data.company || jobDescription.company,
      parsedData: data.parsedData || jobDescription.parsedData,
    },
  })

  revalidatePath("/job-descriptions")

  return {
    success: true,
    message: "Job Description updated successfully!",
  }
}

export const deleteJobDescription = async (jobDescriptionId: string) => {
  const session = await auth()
  if (!session?.user) {
    return {
      error: "Unauthenticated",
      data: null,
    }
  }
  const jobDescription = await prisma.jobDescription.findUnique({
    where: {
      id: jobDescriptionId,
    },
  })
  if (!jobDescription) {
    return {
      error: "Job Description not found",
      data: null,
    }
  }
  if (jobDescription.userId !== session.user.id) {
    return {
      error: "Unauthorized",
      data: null,
    }
  }
  const deleted = await prisma.jobDescription.delete({
    where: {
      id: jobDescriptionId,
      userId: session.user.id,
    },
  }).catch(err => null)

  if (!deleted) {
    return {
      error: "Failed to delete job description",
      data: null,
    }
  }

  revalidatePath("/job-descriptions")
  return {
    error: null,
    data: "Job Description deleted successfully!",
  }
}

export async function   uploadJobDescription(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    return {
      error: "Unauthenticated",
      data: null,
    }
  }

  const file = formData.get("file") as File
  const title = formData.get("title") as string
  const company = formData.get("company") as string
  let description = formData.get("description") as string

  if (file) {
    const filePath = await saveFileToLocal(file)
    description = await extractTextFromPDF(filePath)
  }

  let job_description = ""
  if (title) job_description += `Job Title: ${title}\n`
  if (company) job_description += `Company Name: ${company}\n`
  job_description += `Job Description: ${description}`

  const { data, error} = await parseJobDescriptionWithAi(description)

  if (error || !data) {
    return {
      error,
      data: null,
    }
  }

  const jobDescription = await prisma.jobDescription.create({
    data: {
      title: title,
      company: company,
      parsedData: data,
      user: {
        connect: {
          id: session.user.id,
        },
      }
    },
  }).catch(err => null)

  if (!jobDescription) {
    return {
      error: "Failed to create job description",
      data: null,
    }
  }

  revalidatePath("/job-descriptions")
  return { error: null, data: "Job Description uploaded successfully!" };
}

export const generateJobDescription = async (description: string, title?: string, company_name?: string) => {
  const session = await auth()

  if (!session?.user) {
    return {
      error: "Unauthenticated",
      data: null,
    }
  }

  let prompt = ""
  if (title) prompt += `Job Title: ${title}\n`
  if (company_name) prompt += `Company Name: ${company_name}\n`
  prompt += `Short Description: ${description}`

  const generatedDescription = await createGenAIText(
    prompt,
    jobDescriptionGeneratePrompt,
  )

  if (!generatedDescription?.parts || generatedDescription.parts.length === 0) {
    return {
      error: "Failed to generate job description",
      data: null,
    }
  }

  const parsedResponse = generatedDescription.parts[0].text as string



  return {
    success: true,
    data: parsedResponse,
  };
}

export const parseJobDescriptionWithAi = async (text: string) => {

  try {
    const response = await createGenAIText(
      `Job Description Text: ${text}`,
      jobDescriptionParserPrompt,
      jobDescriptionResponseSchema
    )

    if (!response?.parts) return {
      error: "Failed to parse job description",
      data: null,
    }

    const { data, error } = JobDescriptionParseJsonSchema.safeParse(JSON.parse(response.parts[0].text as string))

    if (error || !data) {
      return {
        error: "Invalid response format from AI",
        data: null,
      }
    }

    return { data, error: null };
  } catch (error) {
    return {
      error: "An error occurred while parsing the job description",
      data: null,
    }
  }
}
