"use server"

import { auth } from "@/auth";
import prisma from "@/config/prisma.config";
import { deleteFileFromS3, previewFile } from "@/config/s3.config"
import { extractTextFromPDF, parseResumeWithAi } from "@/utils/resumeParser";
import { saveFileToLocal, uploadFileToS3 } from "@/utils/uploadResume";
import { revalidatePath } from "next/cache";


export const updateResume = async (resumeId: string, data: any) => {
  const session = await auth();

  if (!session?.user) {
    return {
      error: "Unauthorized access. Please log in to update your resume.",
      data: null,
    }
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: resumeId
    }
  })
  if (!resume) {
    return {
      error: "Resume not found",
      data: null,
    }
  }

  if (resume.userId !== session.user.id) {
    return {
      error: "Unauthorized access. You do not have permission to update this resume.",
      data: null,
    }
  }

  const updatedResume = await prisma.resume.update({
    where: {
      id: resumeId,
      userId: session.user.id,
    },
    data: {
      fileName: data.fileName || resume.fileName,
      fileUrl: data.fileUrl || resume.fileUrl,
      parsedData: data.parsedData || resume.parsedData,
    },
  })
  if (!updatedResume) {
    return {
      error: "Failed to update resume",
      data: null,
    }
  }

  revalidatePath("/resumes");
  return {
    success: true,
    message: "Resume updated successfully!",
  }
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
  console.log("Extracted text from resume:", text)
  const resumeParseData = await parseResumeWithAi(text)
  const { fileUrl, key } = await uploadFileToS3(filePath, name ?? file.name)
  // console.log("Parsed resume data:", resumeParseData)
  const resume = await prisma.resume.create({
    data: {
      fileName: key,
      fileUrl: fileUrl,
      parsedData: resumeParseData,
      user: {
        connect: {
          id: session.user.id,
        },
      }
    }
  })

  revalidatePath("/resumes")
  return { success: true, message: "Resume uploaded successfully!" }
}


export const previewResumeByKey = async (key: string) => {

  const signedUrl = await previewFile({ key, expiresIn: 3600 });
  return signedUrl;
}

export const deleteResume = async (resumeId: string) => {
  const session = await auth();

  if (!session?.user) throw new Error("Unauthorized access. Please log in to delete your resume.");

  const resume = await prisma.resume.delete({
    where: {
      id: resumeId,
      userId: session.user.id,
    },
  })

  if (!resume) throw new Error("Resume not found or you do not have permission to delete it.");

  await deleteResumeByKey(resume.fileName);
  revalidatePath('/resumes');
  return !!resume
}

export const deleteResumeByKey = async (key: string) => {
  return await deleteFileFromS3(key);
}

/**
!. Ways to handle cache invalidation
"use cache"

import { previewFile } from "@/config/s3.config"
import { revalidateTag } from "next/cache"

export const previewResumeByKey = async (key: string) => {
  const signedUrl = await previewFile({ key, expiresIn: 3600 });
  return signedUrl;
}

// Manual invalidation function
export const invalidateResumeCache = async (key?: string) => {
  if (key) {
    // Invalidate specific cache entry
    revalidateTag(`previewResumeByKey-${key}`);
  } else {
    // Invalidate all resume preview caches
    revalidateTag('previewResumeByKey');
  }
}

"use cache"

import { previewFile } from "@/config/s3.config"

export const previewResumeByKey = async (key: string) => {
  const signedUrl = await previewFile({ key, expiresIn: 3600 });
  return signedUrl;
}

// Configure cache options
previewResumeByKey.cacheLife = {
  stale: 1800, // 30 minutes stale time
  revalidate: 3600, // 1 hour revalidation time (matches S3 URL expiration)
  expire: 7200, // 2 hours expiration time
}

2.
"use server"

import { previewFile } from "@/config/s3.config"
import { unstable_cache } from "next/cache"

export const previewResumeByKey = unstable_cache(
  async (key: string) => {
    const signedUrl = await previewFile({ key, expiresIn: 3600 });
    return signedUrl;
  },
  ["preview-resume"], // Cache key prefix
  {
    revalidate: 3600, // Cache for 1 hour (same as S3 signed URL expiration)
    tags: ["resume-preview"] // Optional: for cache invalidation
  }
);

import { revalidateTag } from "next/cache"

// Call this when a resume is updated/deleted
export const invalidateResumePreviewCache = async () => {
  revalidateTag("resume-preview");
}

*/
