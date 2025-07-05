import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  BarChart3,
  Clock,
  Target,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Users,
  TrendingUp,
  Sparkles,
  Brain,
  Award,
  Zap,
  Shield,
  Globe,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="px-4 lg:px-6 h-20 flex items-center border-b bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center justify-center group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Interview AI
          </span>
        </Link>
        <nav className="ml-auto flex gap-6 sm:gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-blue-600 transition-colors relative group">
            How it Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-blue-600 transition-colors relative group">
            Success Stories
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="https://github.com/vishal-kumar3/interview-ai" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-blue-600 transition-colors relative group">
            Star on GitHub
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>
        <div className="ml-8 flex gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="hover:bg-blue-50 transition-colors">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-10 text-center">
              <div className="animate-bounce">
                <Badge
                  variant="secondary"
                  className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200/50 shadow-lg backdrop-blur-sm"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  🚀 AI-Powered Interview Revolution
                </Badge>
              </div>

              <div className="space-y-6 max-w-5xl">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
                  Master Your Next
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    Dream Interview
                  </span>
                </h1>
                <p className="mx-auto max-w-3xl text-xl text-gray-600 md:text-2xl leading-relaxed">
                  Transform your interview skills with AI-powered practice sessions, get instant expert feedback, and
                  boost your confidence. Join thousands who&apos;ve landed their dream jobs with our personalized coaching.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                <Link href="/dashboard" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Start Free Practice
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 pt-6">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Free forever plan</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Instant AI feedback</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-cyan-50/50 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-6 mb-16">
              <Badge
                variant="secondary"
                className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200/50 shadow-lg"
              >
                <Award className="mr-2 h-4 w-4" />
                Features
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Everything You Need to Succeed
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600 leading-relaxed">
                Our comprehensive platform provides all the tools and insights you need to excel in any interview
                scenario with cutting-edge AI technology.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">AI-Powered Questions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get personalized interview questions tailored to your industry, role, and experience level using
                    advanced machine learning algorithms.
                  </p>
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Detailed Analytics</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track your progress with comprehensive performance metrics, scoring, and AI-driven improvement
                    suggestions to accelerate your growth.
                  </p>
                  <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Instant Feedback</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive immediate, actionable feedback on your answers powered by advanced natural language
                    processing to improve in real-time.
                  </p>
                  <div className="w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Flexible Practice</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Practice anytime, anywhere with our cloud-based platform. No downloads or installations required -
                    just pure convenience.
                  </p>
                  <div className="w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">Industry Specific</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Choose from hundreds of interview scenarios across different industries and job roles,
                    from tech to healthcare to finance.
                  </p>
                  <div className="w-full h-1 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Progress Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Monitor your improvement over time with detailed progress reports, skill assessments,
                    and personalized learning paths.
                  </p>
                  <div className="w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced How It Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-28 lg:py-36 bg-white/80 backdrop-blur-xl">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-6 mb-16">
              <Badge
                variant="secondary"
                className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200/50 shadow-lg"
              >
                <Target className="mr-2 h-4 w-4" />
                How It Works
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                Simple Steps to Interview Success
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600 leading-relaxed">
                Get started in minutes and begin improving your interview skills immediately with our intuitive platform.
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              <div className="text-center space-y-6 group">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Choose Your Role</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Select your target job role and industry to get personalized interview questions that match your
                  career goals and experience level.
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="text-center space-y-6 group">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Practice & Record</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Answer interview questions naturally while our advanced AI analyzes your responses for content,
                  delivery, tone, and confidence.
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="text-center space-y-6 group">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Get Expert Feedback</h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Receive detailed feedback with personalized ratings and specific actionable suggestions to dramatically
                  improve your interview performance.
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section id="testimonials" className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-gray-50/80 via-blue-50/80 to-purple-50/80 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-6 mb-16">
              <Badge
                variant="secondary"
                className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200/50 shadow-lg"
              >
                <Star className="mr-2 h-4 w-4" />
                Success Stories
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                Loved by Job Seekers Worldwide
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-gray-600 leading-relaxed">
                Join thousands of professionals who have transformed their interview skills and landed their dream jobs.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="group border-0 shadow-xl hover:shadow-2xl bg-white/90 backdrop-blur-sm transition-all duration-500 hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200" style={{transitionDelay: `${i * 100}ms`}} />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    &quot;Interview AI helped me land my dream job at Google! The AI feedback was incredibly detailed and
                    helped me improve my technical explanations significantly.&quot;
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">SJ</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Sarah Johnson</div>
                      <div className="text-sm text-gray-500 font-medium">Software Engineer at Google</div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-xl hover:shadow-2xl bg-white/90 backdrop-blur-sm transition-all duration-500 hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200" style={{transitionDelay: `${i * 100}ms`}} />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    &quot;The practice sessions boosted my confidence tremendously. I went from nervous wreck to confident
                    candidate in just two weeks of consistent practice!&quot;
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">MC</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Michael Chen</div>
                      <div className="text-sm text-gray-500 font-medium">Product Manager at Meta</div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-xl hover:shadow-2xl bg-white/90 backdrop-blur-sm transition-all duration-500 hover:scale-105 transform">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-200" style={{transitionDelay: `${i * 100}ms`}} />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    &quot;Amazing platform! The feedback is so detailed and actionable. I improved my interview skills
                    significantly and got multiple offers from top companies.&quot;
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">EP</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Emily Parker</div>
                      <div className="text-sm text-gray-500 font-medium">Data Scientist at Netflix</div>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-cyan-600/90"></div>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-3/4 left-3/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
          </div>

          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="text-center space-y-10 text-white">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                  Ready to Ace Your Next Interview?
                </h2>
                <p className="mx-auto max-w-3xl text-xl md:text-2xl text-blue-100 leading-relaxed">
                  Join thousands of successful job seekers who have transformed their interview skills with Interview AI.
                  Start practicing today and land your dream job tomorrow.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
                <Link href="/dashboard" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full h-16 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Sparkles className="mr-3 h-6 w-6" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-16 border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm font-bold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Learn More
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-blue-100 pt-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Free forever plan available</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="w-full py-16 bg-gray-900 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Interview AI
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Master your interviews with AI-powered practice and feedback. Transform your career with confidence
                and land your dream job.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                  <span className="text-xs font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                  <span className="text-xs font-bold">in</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-lg text-white">Product</h4>
              <div className="space-y-3 text-gray-400">
                <Link href="#features" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Features
                </Link>
                <Link href="#how-it-works" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  How it Works
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Pricing
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  API Access
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-lg text-white">Company</h4>
              <div className="space-y-3 text-gray-400">
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  About Us
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Blog
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Careers
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-lg text-white">Support</h4>
              <div className="space-y-3 text-gray-400">
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Help Center
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Privacy Policy
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Terms of Service
                </Link>
                <Link href="#" className="block hover:text-white transition-colors hover:translate-x-1 transform duration-200">
                  Status
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Interview AI. All rights reserved. Built with ❤️ for job seekers worldwide.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
