import { Card, CardContent } from "@/components/ui/card"
import { InterviewSession, InterviewStatus } from "@prisma/client"
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react"

export async function DashboardStats({
  interviews
}: {
  interviews: InterviewSession[]
}) {

  const completedCount = interviews.filter((i) => i.status === InterviewStatus.COMPLETED).length
  const inProgressCount = interviews.filter((i) => i.status === InterviewStatus.STARTED).length
  const totalCount = interviews.length
  const avgCompletion =
    totalCount > 0 ? Math.round(interviews.reduce((acc, i) => acc + 50, 0) / totalCount) : 0

  const stats = [
    {
      title: "Completed Interviews",
      value: completedCount,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "In Progress",
      value: inProgressCount,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      title: "Total Sessions",
      value: totalCount,
      icon: Target,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    },
    {
      title: "Avg. Completion",
      value: `${avgCompletion}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={`border-0 shadow-lg ${stat.bgColor} ${stat.borderColor} border-l-4 hover:shadow-xl transition-shadow duration-200`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
