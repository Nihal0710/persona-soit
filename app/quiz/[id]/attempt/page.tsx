"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { Quiz } from "@/types/quiz"
import { Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import LoginPrompt from "@/components/login-prompt"

export default function QuizAttemptPage() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answers, setAnswers] = useState<
    {
      questionId: string
      selectedAnswer: string
      isCorrect: boolean
      timeSpent: number
    }[]
  >([])
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${id}`)
        const data = await response.json()
        setQuiz(data)
        setTimeLeft(data.questions[0].timeLimit)
        setQuizStartTime(Date.now())
        setQuestionStartTime(Date.now())
      } catch (error) {
        console.error("Error fetching quiz:", error)
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive",
        })
        router.push("/quiz")
      } finally {
        setIsLoading(false)
      }
    }

    if (id && user) {
      fetchQuiz()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [id, user, toast, router])

  useEffect(() => {
    if (!isLoading && quiz) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [isLoading, quiz, currentQuestionIndex])

  const handleNextQuestion = () => {
    if (!quiz) return

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const timeSpent = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0

    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedAnswer: selectedAnswer || "",
        isCorrect,
        timeSpent,
      },
    ]

    setAnswers(newAnswers)

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(quiz.questions[currentQuestionIndex + 1].timeLimit)
      setQuestionStartTime(Date.now())

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    } else {
      // Quiz completed
      submitQuiz(newAnswers)
    }
  }

  const submitQuiz = async (finalAnswers: typeof answers) => {
    if (!quiz || !user || isSubmitting) return

    setIsSubmitting(true)

    const correctAnswers = finalAnswers.filter((a) => a.isCorrect).length
    const totalTimeSpent = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0

    try {
      const response = await fetch("/api/quizzes/attempt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: quiz.id,
          userId: user.uid,
          score: correctAnswers,
          totalQuestions: quiz.questions.length,
          timeSpent: totalTimeSpent,
          answers: finalAnswers,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz")
      }

      const data = await response.json()
      router.push(`/quiz/${id}/results?attemptId=${data.id}`)
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        title: "Error",
        description: "Failed to submit quiz results",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen bg-[#0f172a] py-8">
        <div className="container max-w-3xl">
          <Card className="bg-[#1a2234] border-indigo-900/20">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-indigo-900/30" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-4 w-full bg-indigo-900/30" />
              <Skeleton className="h-4 w-full bg-indigo-900/30" />
              <Skeleton className="h-4 w-3/4 bg-indigo-900/30" />

              <div className="space-y-3 mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full bg-indigo-900/30" />
                    <Skeleton className="h-10 w-full bg-indigo-900/30 rounded-md" />
                  </div>
                ))}
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

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-[#0f172a] py-8">
      <div className="container max-w-3xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <span className="text-white/70">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <Progress value={progress} className="h-2 mt-2 bg-indigo-900/30" />
          </div>
          <div className="flex items-center gap-2 bg-indigo-900/30 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span className={`text-sm font-medium ${timeLeft < 10 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#1a2234] border-indigo-900/20">
              <CardHeader>
                <CardTitle className="text-xl text-white">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer}>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`
                          flex items-center space-x-2 rounded-md border border-indigo-900/30 p-3 
                          ${selectedAnswer === option ? "bg-indigo-900/40 border-indigo-500" : "hover:bg-indigo-900/20"}
                          transition-colors
                        `}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} className="text-indigo-400" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-white">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                >
                  {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Submit Quiz"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

