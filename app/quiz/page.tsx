"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { BarChart, Clock, Trophy, CheckCircle2, XCircle, ArrowRight, LogIn, Home } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Quiz, Question, QuizAttempt } from "@/types/quiz"

export default function QuizPage() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data: quizzesData } = await supabase.from("quizzes").select("*")
        setQuizzes(quizzesData || [])
      } catch (error) {
        console.error("Error fetching quizzes:", error)
      }
    }

    const fetchLeaderboard = async () => {
      try {
        const { data: leaderboardData } = await supabase
          .from("users")
          .select("id, display_name, photo_url, avg_score, quizzes_taken")
          .order("avg_score", { ascending: false })
          .limit(5)
        setLeaderboard(leaderboardData || [])
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      }
    }

    Promise.all([fetchQuizzes(), fetchLeaderboard()]).finally(() => {
      setIsLoading(false)
    })
  }, [])

  // Timer for quiz
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (quizStarted && selectedQuiz && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleSubmitQuiz()
    }

    return () => clearInterval(timer)
  }, [quizStarted, timeLeft, quizCompleted])

  const handleStartQuiz = (quiz: Quiz) => {
    try {
      setSelectedQuiz(quiz)
      setCurrentQuestion(0)
      setAnswers({})
      setTimeLeft(quiz.timeLimit)
      setQuizStarted(true)
      setQuizCompleted(false)
      setActiveTab("quiz")
      setError(undefined)
    } catch (error) {
      setError("Failed to start quiz. Please try again.")
      console.error("Error starting quiz:", error)
    }
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNextQuestion = () => {
    if (!selectedQuiz) return
    
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleSubmitQuiz = async () => {
    if (!user || !selectedQuiz) return

    try {
      // Calculate score
      let correctAnswers = 0
      const questionResults = selectedQuiz.questions.map((question) => {
        const isCorrect = answers[question.id] === question.correctAnswer
        if (isCorrect) correctAnswers++
        return {
          questionId: question.id,
          selectedAnswer: answers[question.id] || "",
          isCorrect,
          timeSpent: selectedQuiz.timeLimit - timeLeft // Approximate time spent
        }
      })

      const calculatedScore = Math.round((correctAnswers / selectedQuiz.questions.length) * 100)
      setScore(calculatedScore)
      setQuizCompleted(true)
      setQuizStarted(false)
      setError(undefined)

      const quizAttempt: Partial<QuizAttempt> = {
        quizId: selectedQuiz.id,
        userId: user.uid,
        score: calculatedScore,
        totalQuestions: selectedQuiz.questions.length,
        completedAt: new Date().toISOString(),
        timeSpent: selectedQuiz.timeLimit - timeLeft,
        answers: questionResults
      }

      const { error: submitError } = await supabase
        .from("quiz_results")
        .insert([quizAttempt])

      if (submitError) {
        throw submitError
      }
    } catch (error) {
      setError("Failed to submit quiz. Please try again.")
      console.error("Error saving quiz result:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-indigo-900/20 bg-[#0f172a]/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-5 w-5 text-indigo-400" />
              <span className="text-white">Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || undefined} />
                  <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-white hidden md:inline">{user.displayName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-indigo-500/50 text-white hover:bg-indigo-950/50"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={signInWithGoogle}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Persona Quiz Platform</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Test your knowledge, track your progress, and compete with others in our interactive quizzes.
          </p>
        </div>

        {!user ? (
          <Card className="max-w-md mx-auto bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription className="text-white/70">
                Please sign in to access quizzes and track your progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-white/70">
                Our quiz platform offers personalized tracking, leaderboards, and progress analytics. Sign in to get
                started!
              </p>
              <Button
                onClick={signInWithGoogle}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with Google
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeTab === "dashboard" && !quizStarted && !quizCompleted && (
              <div className="grid gap-6 md:grid-cols-12">
                <div className="md:col-span-8 space-y-6">
                  <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
                    <CardHeader>
                      <CardTitle>Available Quizzes</CardTitle>
                      <CardDescription className="text-white/70">Select a quiz to test your knowledge</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {quizzes.map((quiz) => (
                          <motion.div key={quiz.id} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                            <Card className="bg-[#131c31]/50 border-indigo-900/10 hover:border-indigo-500/30 transition-colors">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-white text-lg">{quiz.title}</CardTitle>
                                  <Badge
                                    className={`
                                    ${
                                      quiz.difficulty === "easy"
                                        ? "bg-green-900/30 text-green-300"
                                        : quiz.difficulty === "medium"
                                          ? "bg-yellow-900/30 text-yellow-300"
                                          : "bg-red-900/30 text-red-300"
                                    }
                                  `}
                                  >
                                    {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                                  </Badge>
                                </div>
                                <CardDescription className="text-white/70">{quiz.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="flex items-center gap-4 text-sm text-white/70">
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4 text-indigo-400" />
                                    {formatTime(quiz.timeLimit)}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-1">Q:</span>
                                    {quiz.questions.length} questions
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter>
                                <Button
                                  onClick={() => handleStartQuiz(quiz)}
                                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                >
                                  Start Quiz
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
                    <CardHeader>
                      <CardTitle>Your Progress</CardTitle>
                      <CardDescription className="text-white/70">Track your quiz performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Personal Growth Fundamentals</span>
                          <span className="text-white">85%</span>
                        </div>
                        <Progress value={85} className="h-2 bg-gray-800">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </Progress>

                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Professional Communication Skills</span>
                          <span className="text-white">70%</span>
                        </div>
                        <Progress value={70} className="h-2 bg-gray-800">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                            style={{ width: "70%" }}
                          ></div>
                        </Progress>

                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Leadership Principles</span>
                          <span className="text-white">60%</span>
                        </div>
                        <Progress value={60} className="h-2 bg-gray-800">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </Progress>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-4 space-y-6">
                  <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                        Leaderboard
                      </CardTitle>
                      <CardDescription className="text-white/70">Top performers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {leaderboard.map((user, index) => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-6 text-center font-bold text-white/70">{index + 1}</div>
                            <Avatar className="flex-shrink-0">
                              <AvatarImage src={user.photo_url} alt={user.display_name} />
                              <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow min-w-0">
                              <p className="text-white truncate">{user.display_name}</p>
                              <p className="text-white/70 text-sm">{user.quizzes_taken} quizzes</p>
                            </div>
                            <div className="flex-shrink-0 font-bold text-indigo-400">{user.avg_score}%</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="mr-2 h-5 w-5 text-indigo-400" />
                        Your Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#131c31]/50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-400">7</p>
                          <p className="text-white/70 text-sm">Quizzes Taken</p>
                        </div>
                        <div className="bg-[#131c31]/50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-400">72%</p>
                          <p className="text-white/70 text-sm">Avg. Score</p>
                        </div>
                        <div className="bg-[#131c31]/50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-400">12</p>
                          <p className="text-white/70 text-sm">Rank</p>
                        </div>
                        <div className="bg-[#131c31]/50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-400">3</p>
                          <p className="text-white/70 text-sm">Badges</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "quiz" && quizStarted && selectedQuiz && (
              <Card className="max-w-3xl mx-auto bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedQuiz.title}</CardTitle>
                    <div className="flex items-center gap-2 text-white bg-[#131c31]/70 px-3 py-1 rounded-full">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                  <Progress
                    value={((currentQuestion + 1) / selectedQuiz.questions.length) * 100}
                    className="h-2 bg-gray-800 mt-2"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                      style={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }}
                    ></div>
                  </Progress>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-[#131c31]/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">
                        Question {currentQuestion + 1} of {selectedQuiz.questions.length}
                      </h3>
                      <p className="text-white/90 text-lg">{selectedQuiz.questions[currentQuestion].question}</p>
                    </div>

                    <div className="space-y-3">
                      {selectedQuiz.questions[currentQuestion].options.map((option: string) => (
                        <div
                          key={option}
                          onClick={() => handleAnswerSelect(selectedQuiz.questions[currentQuestion].id, option)}
                          className={`
                            p-4 rounded-lg border border-indigo-900/30 cursor-pointer transition-colors
                            ${
                              answers[selectedQuiz.questions[currentQuestion].id] === option
                                ? "bg-indigo-900/30 border-indigo-500"
                                : "bg-[#131c31]/30 hover:bg-[#131c31]/50 hover:border-indigo-900/50"
                            }
                          `}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-white/70 flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Question time: {formatTime(selectedQuiz.questions[currentQuestion].timeLimit)}
                  </div>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[selectedQuiz.questions[currentQuestion].id]}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    {currentQuestion < selectedQuiz.questions.length - 1 ? "Next Question" : "Submit Quiz"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {quizCompleted && selectedQuiz && (
              <Card className="max-w-3xl mx-auto bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
                <CardHeader>
                  <CardTitle>Quiz Results</CardTitle>
                  <CardDescription className="text-white/70">{selectedQuiz.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="inline-block relative">
                      <div className="w-32 h-32 rounded-full bg-[#131c31]/50 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">{score}%</span>
                      </div>
                      <svg className="absolute top-0 left-0" width="128" height="128" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="8" />
                        <circle
                          cx="64"
                          cy="64"
                          r="60"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray="377"
                          strokeDashoffset={377 - (377 * score) / 100}
                          transform="rotate(-90 64 64)"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <h3 className="text-xl font-bold mt-4">
                      {score >= 80 ? "Excellent!" : score >= 60 ? "Good job!" : "Keep practicing!"}
                    </h3>
                    <p className="text-white/70 mt-1">
                      You answered {selectedQuiz.questions.filter((q: any) => answers[q.id] === q.correctAnswer).length}{" "}
                      out of {selectedQuiz.questions.length} questions correctly.
                    </p>
                  </div>

                  <Separator className="my-6 bg-indigo-900/30" />

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Question Review</h3>

                    {selectedQuiz.questions.map((question: any, index: number) => (
                      <div key={question.id} className="bg-[#131c31]/30 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          {answers[question.id] === question.correctAnswer ? (
                            <Badge className="bg-green-900/30 text-green-300">Correct</Badge>
                          ) : (
                            <Badge className="bg-red-900/30 text-red-300">Incorrect</Badge>
                          )}
                        </div>
                        <p className="text-white/90 mb-2">{question.question}</p>

                        <div className="mt-2 space-y-2">
                          <div className="flex items-center">
                            <span className="text-white/70 w-32">Your answer:</span>
                            <span
                              className={
                                answers[question.id] === question.correctAnswer ? "text-green-400" : "text-red-400"
                              }
                            >
                              {answers[question.id] || "No answer"}
                              {answers[question.id] === question.correctAnswer ? (
                                <CheckCircle2 className="inline ml-2 h-4 w-4" />
                              ) : (
                                <XCircle className="inline ml-2 h-4 w-4" />
                              )}
                            </span>
                          </div>

                          {answers[question.id] !== question.correctAnswer && (
                            <div className="flex items-center">
                              <span className="text-white/70 w-32">Correct answer:</span>
                              <span className="text-green-400">{question.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => setActiveTab("dashboard")}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  >
                    Back to Dashboard
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}

