import { Card, CardContent } from "@/components/ui/card"

export function InterviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-0 shadow-md animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
              </div>
              <div className="h-10 w-20 bg-gray-200 rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
