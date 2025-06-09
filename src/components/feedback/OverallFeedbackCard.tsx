import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, Trophy, TrendingUp, Target, Lightbulb } from "lucide-react"
import { InterviewFeedback, HireRecommendation } from "@prisma/client"

interface OverallFeedbackCardProps {
  feedback: InterviewFeedback
}

export function OverallFeedbackCard({ feedback }: OverallFeedbackCardProps) {
  const getRecommendationIcon = (recommendation: HireRecommendation) => {
    switch (recommendation) {
      case "STRONGLY_RECOMMEND":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "RECOMMEND":
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case "NEUTRAL":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "DO_NOT_RECOMMEND":
        return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getRecommendationColor = (recommendation: HireRecommendation) => {
    switch (recommendation) {
      case "STRONGLY_RECOMMEND":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white"
      case "RECOMMEND":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "NEUTRAL":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
      case "DO_NOT_RECOMMEND":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          Overall Interview Assessment
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score and Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(feedback.overallScore || 0)}`}>
                {feedback.overallScore}/100
              </span>
            </div>
            <Progress
              value={feedback.overallScore || 0}
              className="h-3"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Recommendation</span>
            <Badge className={`${getRecommendationColor(feedback.hireRecommendation)} flex items-center gap-2 px-3 py-1`}>
              {getRecommendationIcon(feedback.hireRecommendation)}
              {feedback.hireRecommendation.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Overall Assessment
          </h4>
          <p className="text-gray-700 leading-relaxed">{feedback.feedback}</p>
        </div>

        {/* Strengths, Weaknesses, and Improvements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Strengths */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Key Strengths
            </h4>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Areas to Improve
            </h4>
            <ul className="space-y-2">
              {feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Suggestions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Action Items
            </h4>
            <ul className="space-y-2">
              {feedback.improvementAreas.map((area, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
