"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Quiz, QuizAttempt } from "@/types/quiz"
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import LoginPrompt from "@/components/login-prompt"

export default function QuizResultsPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const attemptId = searchParams.get("attemptId")
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch quiz data
        const quizResponse = await fetch(`/api/quizzes/${id}`)
        const quizData = await quizResponse.json()
        setQuiz(quizData)

        // Fetch attempt data
        const attemptResponse = await fetch(`/api/quizzes/attempt/${attemptId}`)
        const attemptData = await attemptResponse.json()
        setAttempt(attemptData)

        // Fetch leaderboard
        const leaderboardResponse = await fetch(`/api/leaderboard?quizId=${id}`)
        const leaderboardData = await leaderboardResponse.json()
        setLeaderboard(leaderboardData)
      } catch (error) {
        console.error("Error fetching results:", error)
        toast({
          title: "Error",
          description: "Failed to load quiz results",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id && attemptId && user) {
      fetchResults()
    }
  }, [id, attemptId, user, toast])

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

  if (isLoading || !quiz || !attempt) {
    return (
      <div className="min-h-screen bg-[#0f172a] py-8">
        <div className="container max-w-3xl">
          <Skeleton className="h-10 w-32 bg-indigo-900/30 mb-6" />
          <Card className="bg-[#1a2234] border-indigo-900/20">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-indigo-900/30" />
              <Skeleton className="h-4 w-1/2 bg-indigo-900/30 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full bg-indigo-900/30 rounded-md" />
                <Skeleton className="h-20 w-full bg-indigo-900/30 rounded-md" />
                <Skeleton className="h-20 w-full bg-indigo-900/30 rounded-md" />
              </div>
              <Skeleton className="h-40 w-full bg-indigo-900/30 rounded-md" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full bg-indigo-900/30 rounded-md" />
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  const score = attempt.score
  const totalQuestions = attempt.totalQuestions
  const percentage = (score / totalQuestions) * 100
  const userRank = leaderboard.findIndex((entry) => entry.userId === user.uid) + 1

  return (
    <div className="min-h-screen bg-[#0f172a] py-8">
      <div className="container max-w-3xl">
        <Button variant="ghost" className="mb-6 text-white/70 hover:text-white" onClick={() => router.push("/quiz")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-[#1a2234] border-indigo-900/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Quiz Results</CardTitle>
              <CardDescription className="text-white/70">{quiz.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-900/30 mb-4">
                  <span className="text-3xl font-bold text-white">{percentage.toFixed(0)}%</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {percentage >= 70 ? "Great job!" : percentage >= 40 ? "Good effort!" : "Keep practicing!"}
                </h3>
                <p className="text-white/70">
                  You scored {score} out of {totalQuestions} questions correctly
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-900/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="text-sm text-white/70">Time Spent</div>
                  <div className="text-lg font-semibold text-white">{attempt.timeSpent}s</div>
                </div>
                <div className="bg-indigo-900/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="text-sm text-white/70">Accuracy</div>
                  <div className="text-lg font-semibold text-white">{percentage.toFixed(0)}%</div>
                </div>
                <div className="bg-indigo-900/20 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Trophy className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="text-sm text-white/70">Rank</div>
                  <div className="text-lg font-semibold text-white">{userRank > 0 ? `#${userRank}` : "N/A"}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Question Review</h3>
                <div className="space-y-4">
                  {attempt.answers.map((answer, index) => {
                    const question = quiz.questions.find((q) => q.id === answer.questionId)
                    if (!question) return null

                    return (
                      <div key={index} className="bg-indigo-900/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {answer.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium mb-2">{question.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="text-white/70">
                                Your answer:{" "}
                                <span className={answer.isCorrect ? "text-green-400" : "text-red-400"}>
                                  {answer.selectedAnswer || "No answer"}
                                </span>
                              </div>
                              <div className="text-white/70">
                                Correct answer: <span className="text-green-400">{question.correctAnswer}</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-white/60">Time spent: {answer.timeSpent}s</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                onClick={() => router.push(`/quiz/${id}`)}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full border-indigo-500/50 text-white hover:bg-indigo-950/50"
                onClick={() => router.push("/quiz")}
              >
                Back to Quizzes
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

