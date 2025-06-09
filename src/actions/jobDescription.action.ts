"use server"

import { auth } from "@/auth"
import { createGenAIText } from "@/config/gemini.config"
import prisma from "@/config/prisma.config"
import { jobDescriptionParserPrompt } from "@/lib/prompt"
import { jobDescriptionResponseSchema } from "@/schema/jobDescription.schema"
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
  await prisma.jobDescription.delete({
    where: {
      id: jobDescriptionId,
      userId: session.user.id,
    },
  })
  revalidatePath("/job-descriptions")
  return {
    success: true,
    message: "Job Description deleted successfully!",
  }
}

export async function uploadJobDescription(formData: FormData) {
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

  const jobDescriptionParsedData = await parseJobDescriptionWithAi(description)

  const jobDescription = await prisma.jobDescription.create({
    data: {
      title: title,
      company: company,
      parsedData: jobDescriptionParsedData,
      user: {
        connect: {
          id: session.user.id,
        },
      }
    },
  })

  console.log(jobDescription)

  revalidatePath("/job-descriptions")
  return { success: true, message: "Job Description uploaded successfully!" }
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
    `Generate a comprehensive and detailed job description based on the provided information.

Include the following sections:
- Job Overview/Summary
- Key Responsibilities (5-8 bullet points)
- Required Qualifications (education, experience, skills)
- Preferred Qualifications

Make it professional and engaging. The response should be plain text, not JSON. Use bullet points for readability.`,
  )

  if (!generatedDescription?.parts || generatedDescription.parts.length === 0) {
    return {
      error: "Failed to generate job description",
      data: null,
    }
  }
  console.log("Generated:", generatedDescription)
  console.log("Generated parts:", generatedDescription.parts)
  console.log("Generated Description:", generatedDescription.parts[0].text)
  const parsedResponse = generatedDescription.parts[0].text as string
  return {
    success: true,
    data: parsedResponse,
  };
}

export const parseJobDescriptionWithAi = async (text: string): Promise<any> => {

  try {
    const response = await createGenAIText(
      `Job Description Text: ${text}`,
      jobDescriptionParserPrompt,
      jobDescriptionResponseSchema
    )

    if (!response?.parts) throw new Error("No response parts found from AI");

    const parsedResponse = JSON.parse(response.parts[0].text as string)
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing job description with AI:", error);
    throw new Error("Failed to parse job description with AI.");
  }
}
