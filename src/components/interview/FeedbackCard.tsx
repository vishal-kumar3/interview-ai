import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { Feedback } from "@prisma/client"

interface FeedbackCardProps {
  feedback: Feedback
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <Card className="shadow-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          AI Feedback & Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-slate-600 font-medium">Score:</span>
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 text-base">
            {feedback.score} / 10
          </Badge>
        </div>
        <p className="text-slate-700 leading-relaxed text-base sm:text-lg">{feedback.content}</p>
        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
          <p className="text-teal-700 text-sm font-medium">
            ✨ AI is deciding on the next step based on your response...
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
