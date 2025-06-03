// "use client"

// import { useState, useEffect } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Progress } from "@/components/ui/progress"
// import { AlertTriangle, ArrowLeft, RotateCcw, Star, TrendingUp } from "lucide-react"
// import { AudioPlayer } from "@/components/audio-player"
// import { Question } from "@prisma/client"

// interface ReviewPageProps {
//   params: { id: string }
// }

// interface ExtendedResponse extends Response {
//   audioUrl?: string
//   audioDuration?: number
// }

// export default function ReviewPage({ params }: ReviewPageProps) {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [session, setSession] = useState<InterviewSession | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [averageScore, setAverageScore] = useState(0)
//   const [animatedScore, setAnimatedScore] = useState(0)

//   const isTerminated = searchParams.get("terminated") === "true"

//   useEffect(() => {
//     loadSession()
//   }, [params.id])

//   useEffect(() => {
//     if (averageScore > 0) {
//       // Animate score count-up
//       let current = 0
//       const increment = averageScore / 50
//       const timer = setInterval(() => {
//         current += increment
//         if (current >= averageScore) {
//           setAnimatedScore(averageScore)
//           clearInterval(timer)
//         } else {
//           setAnimatedScore(current)
//         }
//       }, 20)
//       return () => clearInterval(timer)
//     }
//   }, [averageScore])

//   const loadSession = async () => {
//     try {
//       // Simulate API call - replace with actual API
//       const mockSession: InterviewSession = {
//         id: params.id,
//         jobTitle: "Senior Frontend Developer",
//         interviewType: "Technical Interview",
//         difficulty: "medium",
//         status: isTerminated ? "terminated" : "completed",
//         currentQuestionIndex: 2,
//         questions: [
//           {
//             id: "1",
//             content: "Explain how you would design a REST API for a social media platform.",
//             type: "technical",
//             isFollowUp: false,
//           },
//           {
//             id: "1-follow",
//             content: "How would you handle rate limiting in your API design?",
//             type: "technical",
//             isFollowUp: true,
//             parentQuestionId: "1",
//           },
//           {
//             id: "2",
//             content: "Tell me about a time when you had to work with a difficult team member.",
//             type: "behavioral",
//             isFollowUp: false,
//           },
//         ],
//         responses: [
//           {
//             id: "r1",
//             questionId: "1",
//             content:
//               "I would design a RESTful API using Node.js and Express, with proper endpoint structure like /api/v1/users, /api/v1/posts, etc. I'd implement authentication using JWT tokens and ensure proper HTTP status codes are returned.",
//             submittedAt: new Date(),
//             audioUrl: "/placeholder-audio.mp3", // Mock audio URL
//             audioDuration: 45,
//           },
//           {
//             id: "r2",
//             questionId: "1-follow",
//             content:
//               "For rate limiting, I would implement a token bucket algorithm using Redis to store rate limit counters. I'd set different limits for different endpoints based on their computational cost.",
//             submittedAt: new Date(),
//           },
//           {
//             id: "r3",
//             questionId: "2",
//             content:
//               "In my previous role, I worked with a team member who was resistant to code reviews. I approached them privately to understand their concerns and worked together to establish a more collaborative review process.",
//             submittedAt: new Date(),
//           },
//         ],
//         feedback: [
//           {
//             id: "f1",
//             responseId: "r1",
//             content:
//               "Good technical explanation covering the basics of REST API design. Consider mentioning scalability aspects like caching, database optimization, and microservices architecture for a more comprehensive answer.",
//             score: 7,
//             generatedAt: new Date(),
//           },
//           {
//             id: "f2",
//             responseId: "r2",
//             content:
//               "Excellent follow-up response! You demonstrated deep understanding of rate limiting strategies and mentioned specific implementation details with Redis. This shows strong system design knowledge.",
//             score: 9,
//             generatedAt: new Date(),
//           },
//           {
//             id: "f3",
//             responseId: "r3",
//             content:
//               "Good behavioral response showing conflict resolution skills. The STAR method could be applied more clearly - consider structuring with Situation, Task, Action, Result for stronger impact.",
//             score: 6,
//             generatedAt: new Date(),
//           },
//         ],
//         malpracticeCount: isTerminated ? 2 : 0,
//         startedAt: new Date(Date.now() - 1800000), // 30 minutes ago
//         completedAt: new Date(),
//       }

//       setSession(mockSession)

//       // Calculate average score
//       const scores = mockSession.feedback.map((f) => f.score)
//       const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
//       setAverageScore(avg)

//       setLoading(false)
//     } catch (error) {
//       console.error("Failed to load session:", error)
//       router.push("/dashboard")
//     }
//   }

//   const getQuestionWithResponse = (question: Question) => {
//     const response = session?.responses.find((r) => r.questionId === question.id)
//     const feedback = response ? session?.feedback.find((f) => f.responseId === response.id) : null
//     return { question, response, feedback }
//   }

//   const getParentResponse = (parentQuestionId: string) => {
//     return session?.responses.find((r) => r.questionId === parentQuestionId)
//   }

//   const formatDuration = (start: Date, end?: Date) => {
//     const duration = (end || new Date()).getTime() - start.getTime()
//     const minutes = Math.floor(duration / 60000)
//     const seconds = Math.floor((duration % 60000) / 1000)
//     return `${minutes}m ${seconds}s`
//   }

//   const getScoreColor = (score: number) => {
//     if (score >= 8) return "text-green-600"
//     if (score >= 6) return "text-yellow-600"
//     return "text-red-600"
//   }

//   const getScoreBadgeColor = (score: number) => {
//     if (score >= 8) return "bg-gradient-to-r from-green-500 to-green-600 text-white"
//     if (score >= 6) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
//     return "bg-gradient-to-r from-red-500 to-red-600 text-white"
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center" >
//         <div className="text-center" >
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" > </div>
//           < p className="text-gray-600" > Loading interview results...</>
//         </div>
//       </div>
//     )
//   }

//   if (!session) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center" >
//         <Alert className="max-w-md" >
//           <AlertTriangle className="h-4 w-4" />
//           <AlertDescription>Interview session not found.Please return to the dashboard.</AlertDescription>
//         </Alert>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-teal-50" >
//       {/* Header */}
//       < div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg" >
//         <div className="max-w-6xl mx-auto p-6" >
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" >
//             <div>
//               <h1 className="text-2xl lg:text-3xl font-bold mb-2" > Interview Review </h1>
//               < p className="text-teal-100" >
//                 {session.jobTitle} • {session.interviewType}
//               </>
//             </div>
//             < div className="flex items-center gap-6" >
//               <div className="text-center" >
//                 <div className="text-3xl font-bold" > {animatedScore.toFixed(1)} </div>
//                 < div className="text-sm text-teal-100" > Average Score </>
//               </div>
//               < div className="text-center" >
//                 <div className="text-2xl font-bold" > {session.responses.length} </div>
//                 < div className="text-sm text-teal-100" > Questions Answered </>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       < div className="max-w-6xl mx-auto p-4 lg:p-6" >
//         {/* Termination Alert */}
//         {
//           isTerminated && (
//             <Alert className="mb-6 border-red-200 bg-red-50" >
//               <AlertTriangle className="h-4 w-4 text-red-600" />
//               <AlertDescription className="text-red-800" >
//                 <strong>Interview Terminated: </strong> Session ended due to multiple security violations (tab switching,
//                 losing focus, etc.). Your responses have been saved for review.
//               </AlertDescription>
//             </Alert>
//           )}

//         {/* Summary Section */}
//         <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm" >
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2" >
//               <TrendingUp className="w-5 h-5 text-teal-600" />
//               Session Summary
//             </CardTitle>
//           </CardHeader>
//           < CardContent >
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
//               <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg" >
//                 <div className="text-2xl font-bold text-teal-700" >
//                   {session.status === "completed" ? "Completed" : "Terminated"}
//                 </div>
//                 < div className="text-sm text-teal-600" > Status </div>
//               </div>
//               < div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg" >
//                 <div className="text-2xl font-bold text-blue-700" >
//                   {formatDuration(session.startedAt, session.completedAt)}
//                 </div>
//                 < div className="text-sm text-blue-600" > Duration </div>
//               </div>
//               < div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg" >
//                 <div className="text-2xl font-bold text-yellow-700" >
//                   {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
//                 </div>
//                 < div className="text-sm text-yellow-600" > Difficulty </div>
//               </div>
//               < div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg" >
//                 <div className="text-2xl font-bold text-purple-700" >
//                   {session.responses.length} / {session.questions.length}
//                 </div>
//                 < div className="text-sm text-purple-600" > Progress </div>
//               </div>
//             </div>

//             {
//               averageScore > 0 && (
//                 <div className="mt-6" >
//                   <div className="flex justify-between items-center mb-2" >
//                     <span className="text-sm font-medium text-gray-600" > Overall Performance </span>
//                     < span className={`text-sm font-bold ${getScoreColor(averageScore)}`
//                     }>
//                       {averageScore.toFixed(1)} / 10
//                     </span>
//                   </div>
//                   < Progress value={(averageScore / 10) * 100
//                   } className="h-3" />
//                   <p className="text-sm text-gray-600 mt-2" >
//                     {averageScore >= 8
//                       ? "Excellent performance! You're well-prepared for interviews."
//                       : averageScore >= 6
//                         ? "Good performance with room for improvement in some areas."
//                         : "Keep practicing to improve your interview skills."}
//                   </p>
//                 </div>
//               )}
//           </CardContent>
//         </Card>

//         {/* Questions and Responses */}
//         <div className="space-y-6" >
//           <h2 className="text-xl font-bold text-gray-800 mb-4" > Detailed Review </h2>

//           {
//             session.questions.map((question, index) => {
//               const { response, feedback } = getQuestionWithResponse(question)
//               const parentResponse = question.parentQuestionId ? getParentResponse(question.parentQuestionId) : null

//               return (
//                 <Card key={question.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm" >
//                   <CardHeader>
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2" >
//                       <div className="flex items-center gap-2" >
//                         <Badge
//                           variant="secondary"
//                           className={`
//                           ${question.type === "technical" ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white" : ""}
//                           ${question.type === "behavioral" ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : ""}
//                           ${question.type === "situational" ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" : ""}
//                         `}
//                         >
//                           {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
//                         </Badge>
//                         {
//                           question.isFollowUp && (
//                             <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900">
//                               Follow - up
//                             </Badge>
//                           )
//                         }
//                       </div>
//                       {
//                         feedback && (
//                           <Badge className={getScoreBadgeColor(feedback.score)}>
//                             <Star className="w-3 h-3 mr-1" />
//                             {feedback.score} / 10
//                           </Badge>
//                         )
//                       }
//                     </div>

//                     {
//                       question.isFollowUp && parentResponse && (
//                         <div className="bg-gray-50 p-3 rounded-lg mb-3 border-l-4 border-yellow-400" >
//                           <p className="text-xs text-gray-500 mb-1" > Based on your previous response: </p>
//                           < p className="text-sm text-gray-700 italic" > "{parentResponse.content.substring(0, 100)}..." </p>
//                         </div>
//                       )
//                     }

//                     <CardTitle className="text-lg text-gray-800 leading-relaxed" > {question.content} </CardTitle>
//                   </CardHeader>

//                   <CardContent>
//                     {
//                       response ? (
//                         <div className="space-y-4" >
//                           <div>
//                             <h4 className="font-medium text-gray-700 mb-2" > Your Response: </h4>
//                             < div className="bg-gray-50 p-4 rounded-lg border" >
//                               <p className="text-gray-800 leading-relaxed" > {response.content} </p>
//                             </div>

//                             {
//                               (response as ExtendedResponse).audioUrl && (
//                                 <div className="mt-3" >
//                                   <h5 className="text-sm font-medium text-gray-600 mb-2" > Audio Response: </h5>
//                                   < AudioPlayer src={(response as ExtendedResponse).audioUrl!
//                                   } />
//                                 </div>
//                               )
//                             }
//                           </div>

//                           {
//                             feedback && (
//                               <div>
//                                 <h4 className="font-medium text-gray-700 mb-2" > Feedback: </h4>
//                                 < div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200" >
//                                   <p className="text-gray-800 leading-relaxed" > {feedback.content} </p>
//                                 </div>
//                               </div>
//                             )
//                           }
//                         </div>
//                       ) : (
//                         <div className="text-center py-8 text-gray-500" >
//                           <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                           <p>Question not answered due to early termination </p>
//                         </div>
//                       )}
//                   </CardContent>
//                 </Card>
//               )
//             })}
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t" >
//           <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex items-center gap-2" >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Dashboard
//           </Button>
//           < Button
//             onClick={() => router.push("/interview/new")}
//             className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white flex items-center gap-2"
//           >
//             <RotateCcw className="w-4 h-4" />
//             Start New Interview
//           </Button>
//         </div>

//         {/* Motivational Footer */}
//         <div className="text-center mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg" >
//           <h3 className="font-bold text-gray-800 mb-2" > Keep Practicing! </h3>
//           < p className="text-gray-600" >
//             {averageScore >= 8
//               ? "Outstanding work! You're ready to ace your next interview."
//               : "Every interview is a learning opportunity. Keep practicing to improve your skills!"}
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
