import { Badge } from "@/components/ui/badge"
import { Clock, Briefcase } from "lucide-react"
import { FullscreenButton } from "./FullscreenButton"
import type { ExtendedInterview } from "@/types/interview.types"

interface InterviewHeaderProps {
  interview: ExtendedInterview
  answeredQuestions: number
  totalQuestions: number
  isGeneratingNext: boolean
}

export function InterviewHeader({
  interview,
  answeredQuestions,
  totalQuestions,
  isGeneratingNext
}: InterviewHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
          {/* Mobile: Title and Timer on same line */}
          <div className="flex items-center justify-between lg:flex-1 lg:min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-teal-600 rounded-lg">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-white truncate">
                    {interview.title}
                  </h1>
                  <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm">
                    <span>{interview.interviewType}</span>
                    <span>•</span>
                    <Badge variant="outline" className="border-teal-400 text-teal-400 text-xs">
                      {interview.difficulty.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: Timer on same line */}
            <div className="flex items-center gap-2 lg:hidden">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Desktop: Right Section */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <FullscreenButton />
          </div>

          {/* Mobile: Fullscreen button */}
          <div className="lg:hidden">
            <FullscreenButton isMobile />
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-3 sm:mt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300 font-medium">
              Question {answeredQuestions + 1} • AI-Adaptive Interview
              {isGeneratingNext && " (AI generating next question...)"}
            </span>
            <span className="hidden sm:inline text-slate-400">
              {answeredQuestions} answered • Dynamic progression
            </span>
          </div>
          <div className="relative">
            <div className="h-2 bg-slate-700 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((answeredQuestions / Math.max(totalQuestions, 5)) * 100, 90)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
