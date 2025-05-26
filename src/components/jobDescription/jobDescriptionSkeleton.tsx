import { Card, CardContent } from "@/components/ui/card"

export function JobDescriptionsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-0 shadow-md animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded-md w-2/3"></div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
                <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
