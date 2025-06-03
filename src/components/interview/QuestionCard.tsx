import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import type { StandardQuestion } from "@/types/interview.types"

interface QuestionCardProps {
  question: StandardQuestion
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-0">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <Badge
              className={`
                px-3 py-1 text-sm font-medium
                ${question.type === "TECHNICAL" ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white" : ""}
                ${question.type === "BEHAVIORAL" ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : ""}
                ${question.type === "SITUATIONAL" ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" : ""}
              `}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {question.type.charAt(0).toUpperCase() + question.type.slice(1).toLowerCase()}
            </Badge>
            {question.isFollowUp && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1">
                Follow-up (Depth: {question.followUpDepth})
              </Badge>
            )}
            {question.topic && (
              <Badge variant="outline" className="border-slate-300 text-slate-600">
                {question.topic}
              </Badge>
            )}
            <Badge variant="outline" className="border-green-400 text-green-600">
              AI Generated
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg sm:text-xl lg:text-2xl text-slate-800 leading-relaxed font-semibold">
          {question.text}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
