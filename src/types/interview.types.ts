import { InterviewSession, Question, Response, Feedback, Resume, JobDescription, SessionMetadata } from "@prisma/client"


export type ExtendedResponse = Response & {
  feedback?: Feedback | null
}

export type ExtendedQuestion = Question & {
  response?: ExtendedResponse | null
}

export type ExtendedInterview = InterviewSession & {
  questions: ExtendedQuestion[]
  resume?: Resume | null
  jobDescription?: JobDescription | null
  sessionMetadata?: SessionMetadata | null
}

export type InterviewWithRelations = InterviewSession & {
  questions: (Question & {
    response?: (Response & {
      feedback?: Feedback | null
    }) | null
  })[]
  resume?: Resume | null
  jobDescription?: JobDescription | null
  sessionMetadata?: SessionMetadata | null
}

// Standardized question type for consistent usage
export type StandardQuestion = Question & {
  response?: (Response & {
    feedback?: Feedback | null
  }) | null
}
