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
import { quizzes as seedQuizzes } from "@/lib/seed-data"
import { forceLogout } from "@/lib/auth-utils"
import AuthPopup from "@/components/auth-popup"

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
  const [userStats, setUserStats] = useState({
    quizzesTaken: 0,
    avgScore: 0,
    rank: 0,
    badges: 0
  })
  const [userProgress, setUserProgress] = useState<{quizId: string, title: string, score: number}[]>([])
  
  // Auth state
  const [isAuthPopupOpen, setIsAuthPopupOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Function to handle successful authentication
  const handleAuthSuccess = () => {
    // Close the auth popup
    setIsAuthPopupOpen(false)
    
    // Fetch user data
    if (user) {
      fetchUserStats()
      fetchUserProgress()
      fetchLeaderboard()
    }
  }

  // Function to handle logout with loading state
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setError(undefined)
      
      // Use the direct force logout utility instead of the context
      await forceLogout()
    } catch (error) {
      console.error("Error during logout:", error)
      setError("Failed to log out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  // Check session on component mount and periodically
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          // If no session, reset user state
          setActiveTab("dashboard")
          if (quizStarted) {
            setQuizStarted(false)
            setError("Your session expired. Please sign in again.")
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    // Check session immediately
    checkSession()

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [quizStarted])

  // Fetch quizzes on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data, error } = await supabase.from("quizzes").select("*")
        if (error) throw error
        setQuizzes(data || seedQuizzes)
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        setQuizzes(seedQuizzes)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  // Fetch user stats and progress when user changes
  useEffect(() => {
    if (user) {
      fetchUserStats()
      fetchUserProgress()
      fetchLeaderboard()
    }
  }, [user])

  // Listen for auth state changes from the popup
  useEffect(() => {
    // When the auth popup closes, check if we have a user and fetch data
    if (!isAuthPopupOpen && user) {
      fetchUserStats()
      fetchUserProgress()
      fetchLeaderboard()
    }
  }, [isAuthPopupOpen, user])

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
      
      // Create the quiz attempt object
      const quizAttempt = {
        user_id: user.id, // Changed from userId to user_id to match DB schema
        quiz_id: selectedQuiz.id, // Changed from quizId to quiz_id to match DB schema
        score: calculatedScore,
        total_questions: selectedQuiz.questions.length,
        completed_at: new Date().toISOString(),
        time_spent: selectedQuiz.timeLimit - timeLeft,
        answers: questionResults
      }

      console.log('Saving quiz result:', quizAttempt);
      
      try {
        // Try to insert the quiz result
        const { data, error: submitError } = await supabase
        .from("quiz_results")
        .insert([quizAttempt])
          .select()

      if (submitError) {
          // If the table doesn't exist, store locally
          if (submitError.code === '42P01') {
            console.log('quiz_results table does not exist. Storing result locally.');
            
            // Store in localStorage
            const localResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
            localResults.push({
              ...quizAttempt,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString()
            });
            localStorage.setItem('quizResults', JSON.stringify(localResults));
            
            console.log('Quiz result saved locally');
          } else {
            throw submitError;
          }
        } else {
          console.log('Quiz result saved to database:', data);
          
          // Update user stats in the users table
          try {
            // First get current user stats
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("quizzes_taken, avg_score, total_score")
              .eq("id", user.id)
              .single();
              
            if (!userError && userData) {
              // Calculate new stats
              const quizzesTaken = (userData.quizzes_taken || 0) + 1;
              const totalScore = (userData.total_score || 0) + calculatedScore;
              const avgScore = Math.round(totalScore / quizzesTaken);
              
              // Update user stats
              await supabase
                .from("users")
                .update({
                  quizzes_taken: quizzesTaken,
                  avg_score: avgScore,
                  total_score: totalScore,
                  last_quiz_at: new Date().toISOString()
                })
                .eq("id", user.id);
            }
          } catch (statsError) {
            console.error("Error updating user stats:", statsError);
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        
        // Fallback to local storage
        const localResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        localResults.push({
          ...quizAttempt,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        });
        localStorage.setItem('quizResults', JSON.stringify(localResults));
        
        console.log('Quiz result saved locally due to database error');
      }
      
      // Refresh leaderboard data
      fetchLeaderboard();
      
      // Refresh user progress
      fetchUserProgress();
      
      setError(undefined);
    } catch (error) {
      console.error("Error saving quiz result:", error);
      setError("Failed to submit quiz. Please try again.");
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Function to fetch leaderboard data
    const fetchLeaderboard = async () => {
      try {
        const { data: leaderboardData } = await supabase
          .from("users")
          .select("id, display_name, photo_url, avg_score, quizzes_taken")
          .order("avg_score", { ascending: false })
          .limit(5)
        setLeaderboard(leaderboardData || [])
      
      // If user is logged in, calculate their rank
      if (user) {
        const { data: allUsers } = await supabase
          .from("users")
          .select("id, avg_score")
          .order("avg_score", { ascending: false })
        
        if (allUsers) {
          const userRank = allUsers.findIndex(u => u.id === user.id) + 1
          setUserStats(prev => ({ ...prev, rank: userRank > 0 ? userRank : 0 }))
        }
      }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
    }
  }
  
  // Function to fetch user stats
  const fetchUserStats = async () => {
    if (!user) return
    
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("quizzes_taken, avg_score")
        .eq("id", user.id)
        .single()
      
      if (!userError && userData) {
        // Calculate badges based on quizzes taken and average score
        let badges = 0
        if (userData.quizzes_taken >= 5) badges++
        if (userData.quizzes_taken >= 10) badges++
        if (userData.avg_score >= 70) badges++
        if (userData.avg_score >= 90) badges++
        
        setUserStats({
          quizzesTaken: userData.quizzes_taken || 0,
          avgScore: userData.avg_score || 0,
          rank: userStats.rank,
          badges
        })
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  // Function to fetch user progress
  const fetchUserProgress = async () => {
    if (!user) return
    
    try {
      // Get user's quiz results
      const { data: quizResults, error: resultsError } = await supabase
        .from("quiz_results")
        .select("quiz_id, score")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(3)
      
      if (resultsError) throw resultsError
      
      if (quizResults && quizResults.length > 0) {
        // Get quiz titles
        const quizIds = quizResults.map(result => result.quiz_id)
        const { data: quizData } = await supabase
          .from("quizzes")
          .select("id, title")
          .in("id", quizIds)
        
        if (quizData) {
          const progressData = quizResults.map(result => {
            const quiz = quizData.find(q => q.id === result.quiz_id)
            return {
              quizId: result.quiz_id,
              title: quiz ? quiz.title : "Unknown Quiz",
              score: result.score
            }
          })
          
          setUserProgress(progressData)
        }
      } else {
        // If no results, use default data for demonstration
        setUserProgress([
          { quizId: "1", title: "Personal Growth Fundamentals", score: 85 },
          { quizId: "2", title: "Professional Communication Skills", score: 70 },
          { quizId: "3", title: "Leadership Principles", score: 60 }
        ])
      }
    } catch (error) {
      console.error("Error fetching user progress:", error)
      // Use default data if there's an error
      setUserProgress([
        { quizId: "1", title: "Personal Growth Fundamentals", score: 85 },
        { quizId: "2", title: "Professional Communication Skills", score: 70 },
        { quizId: "3", title: "Leadership Principles", score: 60 }
      ])
    }
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
                  <AvatarImage src={user.user_metadata?.avatar_url || undefined} alt={user.user_metadata?.full_name || undefined} />
                  <AvatarFallback>{user.user_metadata?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-white hidden md:inline">{user.user_metadata?.full_name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="border-indigo-500/50 text-white hover:bg-indigo-950/50"
                >
                  {isLoggingOut ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing Out
                    </span>
                  ) : "Sign Out"}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthPopupOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Sign Up
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
              <div className="space-y-3">
                <Button
                  onClick={() => setIsAuthPopupOpen(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In / Sign Up
                </Button>
                <Button
                  onClick={() => setIsAuthPopupOpen(true)}
                  variant="outline"
                  className="w-full border-indigo-900/50 text-white hover:bg-indigo-900/30"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  Sign in with Google
                </Button>
              </div>
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
                      <div className="flex justify-between items-center">
                      <CardTitle>Your Progress</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => fetchUserProgress()}
                          className="text-white/70 hover:text-white hover:bg-indigo-900/30"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                          </svg>
                          Refresh
                        </Button>
                      </div>
                      <CardDescription className="text-white/70">Track your quiz performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userProgress.length > 0 ? (
                          userProgress.map((progress, index) => (
                            <div key={index}>
                        <div className="flex justify-between items-center">
                                <span className="text-white/70">{progress.title}</span>
                                <span className="text-white">{progress.score}%</span>
                        </div>
                              <Progress value={progress.score} className="h-2 bg-gray-800">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                                  style={{ width: `${progress.score}%` }}
                          ></div>
                        </Progress>
                        </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-white/70">No progress data available yet.</p>
                            <p className="text-white/50 text-sm mt-1">Complete quizzes to see your progress!</p>
                        </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-4 space-y-6">
                  <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                        Leaderboard
                      </CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => fetchLeaderboard()}
                          className="text-white/70 hover:text-white hover:bg-indigo-900/30"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                          </svg>
                          Refresh
                        </Button>
                      </div>
                      <CardDescription className="text-white/70">Top performers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {leaderboard.length > 0 ? (
                      <div className="space-y-4">
                        {leaderboard.map((user, index) => (
                            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#131c31]/50 transition-colors">
                              <div className="flex-shrink-0 w-6 text-center font-bold text-white/70">
                                {index === 0 ? (
                                  <span className="text-yellow-400">🥇</span>
                                ) : index === 1 ? (
                                  <span className="text-gray-300">🥈</span>
                                ) : index === 2 ? (
                                  <span className="text-amber-600">🥉</span>
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <Avatar className="flex-shrink-0 border-2 border-indigo-500/30">
                              <AvatarImage src={user.photo_url} alt={user.display_name} />
                                <AvatarFallback>{user.display_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow min-w-0">
                                <p className="text-white truncate font-medium">{user.display_name}</p>
                                <p className="text-white/70 text-sm">{user.quizzes_taken || 0} quizzes</p>
                            </div>
                              <div className="flex-shrink-0 font-bold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded-md">
                                {user.avg_score || 0}%
                              </div>
                          </div>
                        ))}
                      </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-white/70">No leaderboard data available yet.</p>
                          <p className="text-white/50 text-sm mt-1">Complete quizzes to appear on the leaderboard!</p>
                        </div>
                      )}
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
                          <p className="text-3xl font-bold text-indigo-400">{userStats.quizzesTaken}</p>
                          <p className="text-white/70 text-sm">Quizzes Taken</p>
                        </div>
                        <div className="bg-[#131c31]/50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-400">{userStats.avgScore}%</p>
                          <p className="text-white/70 text-sm">Avg. Score</p>
                        </div>
                        <div className="bg-[#131c31]/50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-400">{userStats.rank || '-'}</p>
                          <p className="text-white/70 text-sm">Rank</p>
                        </div>
                        <div className="bg-[#131c31]/50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-400">{userStats.badges}</p>
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

      {/* Debug section */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/80 text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
          <p className="font-medium">Error</p>
          <p className="text-sm text-white/80">{error}</p>
        </div>
      )}
      
      {/* Emergency logout button */}
      <div className="fixed bottom-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Clear all auth data and reload
            localStorage.clear();
            window.location.href = '/quiz';
          }}
          className="bg-red-900/30 border-red-500/50 text-white hover:bg-red-900/50"
        >
          Emergency Reset
        </Button>
      </div>

      {/* Auth Popup */}
      <AuthPopup 
        isOpen={isAuthPopupOpen} 
        onClose={() => setIsAuthPopupOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

