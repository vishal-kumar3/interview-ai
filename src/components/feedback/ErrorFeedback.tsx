import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface ErrorFeedbackProps {
  message: string
}

export function ErrorFeedback({ message }: ErrorFeedbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  )
}
