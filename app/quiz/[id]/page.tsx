"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Quiz } from "@/types/quiz"
import { ArrowLeft, Clock, Trophy, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import LoginPrompt from "@/components/login-prompt"

export default function QuizDetailPage() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${id}`)
        const data = await response.json()
        setQuiz(data)
      } catch (error) {
        console.error("Error fetching quiz:", error)
        toast({
          title: "Error",
          description: "Failed to load quiz details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/leaderboard?quizId=${id}`)
        const data = await response.json()
        setLeaderboard(data)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      }
    }

    if (id) {
      fetchQuiz()
      fetchLeaderboard()
    }
  }, [id, toast])

  const startQuiz = () => {
    router.push(`/quiz/${id}/attempt`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full bg-indigo-900/30 mx-auto" />
          <Skeleton className="h-4 w-48 mt-4 bg-indigo-900/30 mx-auto" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPrompt />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] py-8">
        <div className="container">
          <Button variant="ghost" className="mb-6 text-white/70 hover:text-white" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Button>

          <Card className="bg-[#1a2234] border-indigo-900/20">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-indigo-900/30" />
              <Skeleton className="h-4 w-1/2 bg-indigo-900/30 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full bg-indigo-900/30 rounded-md" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full bg-indigo-900/30 rounded-md" />
                <Skeleton className="h-16 w-full bg-indigo-900/30 rounded-md" />
                <Skeleton className="h-16 w-full bg-indigo-900/30 rounded-md" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full bg-indigo-900/30 rounded-md" />
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#0f172a] py-8">
        <div className="container text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Not Found</h2>
          <p className="text-white/70 mb-6">The quiz you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.push("/quiz")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            Back to Quizzes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] py-8">
      <div className="container">
        <Button variant="ghost" className="mb-6 text-white/70 hover:text-white" onClick={() => router.push("/quiz")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="bg-[#1a2234] border-indigo-900/20 h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/70">
                        {quiz.category}
                      </Badge>
                      <CardTitle className="text-2xl text-white">{quiz.title}</CardTitle>
                      <CardDescription className="text-white/70 mt-2">{quiz.description}</CardDescription>
                    </div>
                    <Badge
                      className={`
                      ${
                        quiz.difficulty === "easy"
                          ? "bg-green-900/50 text-green-300 hover:bg-green-900/70"
                          : quiz.difficulty === "medium"
                            ? "bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70"
                            : "bg-red-900/50 text-red-300 hover:bg-red-900/70"
                      }
                    `}
                    >
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-900/20 rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <Clock className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="text-sm text-white/70">Time Limit</div>
                      <div className="text-lg font-semibold text-white">{quiz.timeLimit} sec</div>
                    </div>
                    <div className="bg-indigo-900/20 rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <Users className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="text-sm text-white/70">Questions</div>
                      <div className="text-lg font-semibold text-white">{quiz.questions.length}</div>
                    </div>
                    <div className="bg-indigo-900/20 rounded-lg p-4 text-center">
                      <div className="flex justify-center mb-2">
                        <Trophy className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="text-sm text-white/70">Top Score</div>
                      <div className="text-lg font-semibold text-white">
                        {leaderboard.length > 0 ? `${leaderboard[0].score}/${quiz.questions.length}` : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Quiz Rules</h3>
                    <ul className="list-disc list-inside text-white/70 space-y-1">
                      <li>
                        Each question has a time limit of {Math.floor(quiz.timeLimit / quiz.questions.length)} seconds
                      </li>
                      <li>You cannot go back to previous questions</li>
                      <li>Your score is based on correct answers and time taken</li>
                      <li>Results will be displayed immediately after completion</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={startQuiz}
                  >
                    Start Quiz
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-[#1a2234] border-indigo-900/20">
                <CardHeader>
                  <CardTitle className="text-white">Leaderboard</CardTitle>
                  <CardDescription className="text-white/70">Top performers for this quiz</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.length > 0 ? (
                    <div className="space-y-3">
                      {leaderboard.slice(0, 5).map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-indigo-900/20">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-900/50 text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-900/30">
                              {entry.photoUrl ? (
                                <img
                                  src={entry.photoUrl || "/placeholder.svg"}
                                  alt={entry.displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                  {entry.displayName?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-white truncate">
                              {entry.displayName || "Anonymous"}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {entry.score}/{quiz.questions.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-white/70">
                      No attempts yet. Be the first to complete this quiz!
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

