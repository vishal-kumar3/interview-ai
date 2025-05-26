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
import { Upload, Building, X, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { uploadJobDescription } from "@/app/actions/file-action"

const formSchema = z.object({
  title: z.string().min(1, "Please enter the job title"),
  company: z.string().min(1, "Please enter the company name"),
  file: z.instanceof(File).refine((file) => file.size > 0, "Please select a file"),
})

type FormData = z.infer<typeof formSchema>

interface UploadJobDescriptionModalProps {
  variant?: "default" | "sidebar"
}

export function UploadJobDescriptionModal({ variant = "default" }: UploadJobDescriptionModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: "",
    },
  })

  const selectedFile = form.watch("file")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", data.file)
      formData.append("title", data.title)
      formData.append("company", data.company)

      const result = await uploadJobDescription(formData)
      if (result.success) {
        toast.success(result.message)
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
      <DialogContent className="sm:max-w-[500px]">
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

            {/* File Upload Area */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description File</FormLabel>
                  <FormControl>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
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
                          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
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
                disabled={isLoading || !selectedFile}
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
