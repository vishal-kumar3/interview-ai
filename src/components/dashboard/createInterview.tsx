"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PlusCircle, FileText, User, Target, Brain, Users, Lightbulb } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { createInterviewSession } from "@/app/actions/interview-actions"
import { Difficulty, InterviewType, JobDescription, Resume } from "@prisma/client"

const formSchema = z.object({
  jobDescriptionId: z.string().min(1, "Please select a job description"),
  resumeId: z.string().min(1, "Please select a resume"),
  interviewType: z.enum(Object.values(InterviewType) as [string, ...string[]]),
  difficulty: z.enum(Object.values(Difficulty) as [string, ...string[]]),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateInterviewModalProps {
  resumes: Resume[]
  jobDescriptions: JobDescription[]
  variant?: "default" | "sidebar"
}

export function CreateInterviewModal({
  resumes,
  jobDescriptions,
  variant = "default"
}: CreateInterviewModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewType: "Technical",
      difficulty: "Intermediate",
      notes: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      const result = await createInterviewSession(formData)
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
        form.reset()
      }
    } catch (error) {
      toast.error("Failed to create interview session")
    } finally {
      setIsLoading(false)
    }
  }

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "Technical":
        return <Target className="h-5 w-5 text-blue-600" />
      case "Behavioral":
        return <Users className="h-5 w-5 text-green-600" />
      case "Situational":
        return <Lightbulb className="h-5 w-5 text-purple-600" />
      default:
        return <Brain className="h-5 w-5 text-gray-600" />
    }
  }

  const triggerButton =
    variant === "sidebar" ? (
      <Button className="w-full justify-start bg-teal-600 hover:bg-teal-700 text-white">
        <PlusCircle className="h-4 w-4 mr-2" />
        New Interview
      </Button>
    ) : (
      <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg">
        <PlusCircle className="h-4 w-4 mr-2" />
        Create New Interview
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-teal-600" />
            Create New Mock Interview
          </DialogTitle>
          <DialogDescription>
            Set up a personalized interview session tailored to your target role and experience level.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Description Selection */}
            <FormField
              control={form.control}
              name="jobDescriptionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600" />
                    Job Description
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job description" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobDescriptions.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{job.title}</span>
                            <span className="text-sm text-gray-500">{job.company}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the job description to tailor interview questions to the role.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Resume Selection */}
            <FormField
              control={form.control}
              name="resumeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-600" />
                    Resume
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your resume" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.fileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Your resume will be used to generate personalized questions.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interview Type */}
            <FormField
              control={form.control}
              name="interviewType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-teal-600" />
                    Interview Type
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      {["Technical", "Behavioral", "Situational"].map((type) => (
                        <div
                          key={type}
                          className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value={type} id={type} />
                          <Label htmlFor={type} className="flex items-center gap-3 cursor-pointer flex-1">
                            {getInterviewTypeIcon(type)}
                            <div>
                              <div className="font-medium">{type}</div>
                              <div className="text-sm text-gray-500">
                                {type === "Technical" && "Coding problems, system design, technical concepts"}
                                {type === "Behavioral" && "Past experiences, soft skills, cultural fit"}
                                {type === "Situational" && "Hypothetical scenarios, problem-solving approaches"}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Level */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-teal-600" />
                    Difficulty Level
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Beginner">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Beginner - Entry level questions</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Intermediate">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span>Intermediate - Mid-level complexity</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Advanced">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>Advanced - Senior level challenges</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose the appropriate difficulty based on your experience level.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Focus on system design questions, emphasize leadership experience..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Provide any specific focus areas or preferences for your interview.</FormDescription>
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
                disabled={isLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Start Interview
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
