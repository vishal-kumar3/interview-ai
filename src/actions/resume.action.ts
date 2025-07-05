"use server";

import { auth } from "@/auth";
import prisma from "@/config/prisma.config";
import { deleteFileFromS3, previewFile } from "@/config/s3.config";
import { extractTextFromPDF, parseResumeWithAi } from "@/utils/PDFParser";
import { saveFileToLocal, fileToS3 } from "@/utils/upload";
import { resumeParseJsonSchema } from "@/schema/resume.schema";
import { revalidatePath } from "next/cache";
import { EntityType } from "@/types/user.types";
import { createCacheKey, redisCache, RedisCachePrefix } from "@/config/redis.config";

export const getResumes = async (userId?: string) => {
  if (!userId) {
    const session = await auth();
    if (!session?.user) {
      return {
        error: "Unauthorized access. Please log in to view your resumes.",
        data: null
      }
    }
    userId = session.user.id!;
  }

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return {
    data: resumes,
    error: null,
  }
}

export const updateResume = async (resumeId: string, data: any) => {
  const session = await auth();

  if (!session?.user) {
    return {
      error: "Unauthorized access. Please log in to update your resume.",
    };
  }

  try {
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    if (!resume) {
      return {
        error: "Resume not found",
      };
    }

    if (resume.userId !== session.user.id) {
      return {
        error: "Unauthorized access. You do not have permission to update this resume.",
      };
    }

    // Validate parsedData with Zod schema if provided
    if (data.parsedData) {
      try {
        const validatedParsedData = resumeParseJsonSchema.parse(
          data.parsedData
        );
        data.parsedData = validatedParsedData;
      } catch (zodError) {
        return {
          error: "Invalid resume data format. Please check your entries and try again.",
        };
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
    });

    if (!updatedResume) {
      return {
        error: "Failed to update resume",
      };
    }

    revalidatePath("/resumes");
    return {
      data: true,
    };
  } catch (error) {
    return {
      error: "An unexpected error occurred while updating the resume.",
    };
  }
};

export async function uploadResume(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return {
      error: "Unauthorized access. Please log in to upload your resume.",
    }
  }

  const file = formData.get("file") as File;
  const name = formData.get("name") as string;

  // save to local
  const { data: filePath, error: saveFileError } = await saveFileToLocal(file);
  if (saveFileError || !filePath) {
    return {
      error: "Failed to save file locally.",
      data: null
    }
  }
  const { data: text, error: extractTextError } = await extractTextFromPDF(filePath);
  if (extractTextError || !text) {
    return {
      error: "Failed to extract text from PDF.",
      data: null
    };
  }
  const { data: resumeParseData, error: parseError } = await parseResumeWithAi(text);
  if (parseError || !resumeParseData) {
    return {
      error: "Failed to parse resume with AI.",
      data: null
    };
  }

  const { error: uploadError, data } = await fileToS3(filePath, name ?? file.name, EntityType.RESUME);

  if (uploadError || !data) {
    return {
      error: "Failed to upload resume file to S3.",
      data: null
    };
  }

  const resume = await prisma.resume.create({
    data: {
      fileName: data.key,
      fileUrl: data.fileUrl,
      parsedData: resumeParseData,
      user: {
        connect: {
          id: session.user.id,
        },
      },
    },
  });

  if (!resume) {
    return {
      error: "Failed to create resume record in the database.",
      data: null
    };
  }

  revalidatePath("/resumes");
  return {
    data: resume,
    error: null
  };
}

export const previewResumeByKey = async (key: string) => {
  let signedUrl = null

  signedUrl = await redisCache.get(
    createCacheKey(RedisCachePrefix.RESUME, key)
  )

  if (!signedUrl) {
    signedUrl = await previewFile({ key, expiresIn: 3600 });
    if (!signedUrl) return { error: "Failed to generate signed URL for resume preview." };
    await redisCache.set(
      createCacheKey(RedisCachePrefix.RESUME, key),
      signedUrl,
      3600
    );
  }

  return { signedUrl, error: null };
};

export const deleteResume = async (resumeId: string, resumeKey: string) => {
  const session = await auth();

  if (!session?.user)
    return {
      error: "Unauthorized access. Please log in to delete your resume.",
      success: false,
    };

  const resume = await prisma.resume.delete({
    where: {
      id: resumeId,
      userId: session.user.id,
    },
  });

  if (!resume) return { error: "Resume not found or you do not have permission to delete it.", success: false };

  await deleteResumeByKey(resume.fileName);
  await redisCache.del(createCacheKey(RedisCachePrefix.RESUME, resume.fileName));
  revalidatePath("/resumes");
  return {
    success: true,
    error: null
  };
};

export const deleteResumeByKey = async (key: string) => {
  return await deleteFileFromS3(key);
};

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
