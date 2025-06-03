import { Card, CardContent } from "@/components/ui/card"

export function LoadingIndicator() {
  return (
    <Card className="shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          <h3 className="text-lg font-semibold text-blue-800">AI is Planning Next Question</h3>
        </div>
        <p className="text-blue-600 mb-2">
          Analyzing your response and determining the best next step...
        </p>
        <p className="text-sm text-blue-500">
          This could be a follow-up question, topic transition, or interview conclusion
        </p>
      </CardContent>
    </Card>
  )
}
