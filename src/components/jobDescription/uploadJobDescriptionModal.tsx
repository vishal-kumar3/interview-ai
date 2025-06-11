"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Upload, Building, X, CheckCircle, Sparkles } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { generateJobDescription, uploadJobDescription } from "@/actions/jobDescription.action"
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams } from "next/navigation"

const jobDescriptionFormSchema = z.object({
  title: z.string().min(1, "Please enter the job title"),
  company: z.string().optional(),
  file: z.instanceof(File).optional(),
  description: z.string().optional().refine(val => val && val?.length === 0 || val && val?.length > 0, {
    message: "Please enter a job description if not uploading a file",
  }),
}).refine((data) => data.file || (data.description && data.description.length > 0), {
  message: "Please either upload a file or enter a job description",
  path: ["description"]
})

type FormData = z.infer<typeof jobDescriptionFormSchema>

interface UploadJobDescriptionModalProps {
  variant?: "default" | "sidebar"
}

export function UploadJobDescriptionModal({ variant = "default" }: UploadJobDescriptionModalProps) {
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(searchParams.get('uploadJobDescription') === 'true' || false)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loadingGenerateWithAI, setLoadingGenerateWithAI] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(jobDescriptionFormSchema),
    defaultValues: {
      title: "",
      company: "",
    },
    reValidateMode: "onChange",
  })

  const selectedFile = form.watch("file")
  const selectedDescription = form.watch("description")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("company", data.company || "")
      if (data.file) {
        formData.append("file", data.file)
      } else if (data.description) {
        formData.append("description", data.description)
      }

      const result = await uploadJobDescription(formData)
      if (result.data) {
        toast.success(result.data)
        setOpen(false)
        form.reset()
      }
    } catch (error) {
      toast.error("Failed to upload job description")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type === "application/pdf" || file.type.includes("pdf")) {
        form.setValue("file", file)
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      form.setValue("file", file)
    }
  }

  const generateJobDescriptionButton = async () => {
    const description = form.getValues("description") as string
    const title = form.getValues("title")
    const company = form.getValues("company")

    if (description.length < 15) {
      return form.setError("description", {
        type: "manual",
        message: "Please enter a more detailed job description.",
      })
    }

    setLoadingGenerateWithAI(true)
    const gen_description = await generateJobDescription(description, title, company)
    if (gen_description.error) {
      return toast.error(gen_description.error)
    }
    form.setValue("description", gen_description.data ?? "")
    setLoadingGenerateWithAI(false)
  }

  const triggerButton =
    variant === "sidebar" ? (
      <Button className="w-full justify-start bg-teal-600 hover:bg-teal-700 text-white">
        <Upload className="h-4 w-4 mr-2" />
        Upload Job Description
      </Button>
    ) : (
      <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
        <Upload className="h-4 w-4 mr-2" />
        Upload New Job Description
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[92%] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building className="h-6 w-6 text-teal-600" />
            Upload Job Description
          </DialogTitle>
          <DialogDescription>Upload a job description to generate targeted interview questions.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Frontend Developer" {...field} />
                  </FormControl>
                  <FormDescription>Enter the exact job title from the posting.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Name */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., TechCorp Inc." {...field} />
                  </FormControl>
                  <FormDescription>Enter the company name for this position.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Job Description</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      className="hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!selectedDescription || selectedDescription.length === 0 || !!selectedFile}
                      onClick={generateJobDescriptionButton}
                    >
                      {/* if loadingGenerateWithAI is true replace this sparkle with loading else sparkle */}
                      {loadingGenerateWithAI ? (
                        <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full mr-2"></div>
                      ) :
                        <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                      }
                      Generate With AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      disabled={!!selectedFile}
                      placeholder={"Write short description and use AI to generate a full job description..."}
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter job description text as an alternative to file upload.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Area */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description File</FormLabel>
                  <FormControl>
                    <div
                      aria-disabled={!!selectedDescription && selectedDescription?.length > 0}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${dragActive
                        ? "border-teal-500 bg-teal-50"
                        : selectedFile
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                        }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        disabled={!!selectedDescription && selectedDescription?.length > 0}
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium text-green-800">{selectedFile.name}</p>
                            <p className="text-sm text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => form.setValue("file", undefined as any)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-gray-700">Drop job description here</p>
                            <p className="text-sm text-gray-500">or click to browse files</p>
                          </div>
                          <Button type="button" variant="outline" disabled={!!selectedDescription && selectedDescription?.length > 0} className="disabled:cursor-not-allowed disabled:opacity-50" onClick={() => fileInputRef.current?.click()}>
                            Choose File
                          </Button>
                          <p className="text-xs text-gray-400">PDF files only, max 10MB</p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (!selectedFile && !form.watch("description"))}
                className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
