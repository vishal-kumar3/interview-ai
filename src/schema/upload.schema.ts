import { z } from 'zod';


export const resumeUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size must be less than 5MB',
    })
    .refine((file) => ['application/pdf'].includes(file.type), {
      message: 'File type must be PDF',
    }),
  fileName: z.string().min(1, "File name is required").optional(),
})
