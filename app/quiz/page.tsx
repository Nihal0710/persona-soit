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
import { createQuizzesTable, createQuestionsTable, createQuizAttemptsTable, tableExists, flattenQuiz, flattenQuestion } from "@/lib/database-setup"
import { v4 as uuidv4 } from 'uuid'

export default function QuizPage() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, logout, checkSession } = useAuth()
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
  const [isEmergencyResetting, setIsEmergencyResetting] = useState(false)

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
            setIsAuthPopupOpen(true)
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

  // Function to seed the database with initial quiz data
  const seedDatabase = async () => {
    try {
      console.log('Attempting to seed database with initial quiz data...')
      
      // Check if quizzes table exists
      const quizzesTableExists = await tableExists('quizzes')
      
      if (!quizzesTableExists) {
        console.log('Quizzes table does not exist. Tables should be created via migrations.')
        return
      }
      
      // Check if there are already quizzes in the database
      const { data: existingQuizzes, error: checkError } = await supabase
        .from('quizzes')
        .select('id')
        .limit(1)
      
      if (checkError) {
        console.error('Error checking existing quizzes:', checkError)
        return
      }
      
      if (existingQuizzes && existingQuizzes.length > 0) {
        console.log('Database already has quizzes, skipping seed')
        return
      }
      
      console.log('Seeding quizzes and questions...')
      
      // Insert the quizzes and questions
      for (const quiz of seedQuizzes) {
        // Extract questions before inserting quiz
        const questions = [...quiz.questions]
        
        // Flatten the quiz object for database insertion
        const flattenedQuiz = flattenQuiz(quiz)
        
        // Insert the quiz
        const { error: insertError } = await supabase
          .from('quizzes')
          .insert([flattenedQuiz])
        
        if (insertError) {
          console.error(`Error inserting quiz "${quiz.title}":`, insertError)
          continue
        }
        
        console.log(`Successfully inserted quiz: ${quiz.title}`)
        
        // Insert the questions with a reference to the quiz
        for (const question of questions) {
          // Flatten the question object for database insertion
          const flattenedQuestion = flattenQuestion(question, quiz.id)
          
          const { error: insertQuestionError } = await supabase
            .from('questions')
            .insert([flattenedQuestion])
          
          if (insertQuestionError) {
            console.error(`Error inserting question for quiz "${quiz.title}":`, insertQuestionError)
          }
        }
      }
      
      console.log('Database seeding completed successfully')
    } catch (error) {
      console.error('Error seeding database:', error)
    }
  }

  // Helper function to validate quiz data structure
  const validateQuizData = (quizData: any[]): Quiz[] => {
    try {
      // Check if the data is an array
      if (!Array.isArray(quizData)) {
        console.error('Quiz data is not an array')
        return seedQuizzes
      }
      
      // Validate each quiz
      const validQuizzes = quizData.filter(quiz => {
        // Check required fields
        if (!quiz.id || !quiz.title || !quiz.description || !Array.isArray(quiz.questions)) {
          console.error('Quiz missing required fields:', quiz)
          return false
        }
        
        // Check if questions are properly structured
        const validQuestions = quiz.questions.every((q: any) => 
          q.id && q.question && Array.isArray(q.options) && q.correctAnswer && q.type
        )
        
        if (!validQuestions) {
          console.error('Quiz has invalid questions:', quiz)
          return false
        }
        
        return true
      })
      
      if (validQuizzes.length === 0) {
        console.error('No valid quizzes found in data')
        return seedQuizzes
      }
      
      return validQuizzes as Quiz[]
    } catch (error) {
      console.error('Error validating quiz data:', error)
      return seedQuizzes
    }
  }

  // Fetch quizzes on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // First check if the quizzes table exists
        const quizzesTableExists = await tableExists('quizzes')
        
        // If table doesn't exist, use seed data and try to create it
        if (!quizzesTableExists) {
          console.log('Quizzes table does not exist, using seed data')
          setError(undefined) // Clear any previous errors
          setQuizzes(seedQuizzes)
          
          // Try to seed the database for future use
          if (user) {
            await seedDatabase()
          }
          return
        }
        
        // If table exists, try to fetch quizzes
        const { data: quizzesData, error: quizzesError } = await supabase
          .from("quizzes")
          .select("*")
        
        if (quizzesError) {
          console.error("Error fetching quizzes:", quizzesError)
          setError(`Error fetching quizzes: ${quizzesError.message}`)
          setQuizzes(seedQuizzes)
          return
        }
        
        // If we got data but it's empty, use seed data
        if (!quizzesData || quizzesData.length === 0) {
          console.log('No quizzes found in database, using seed data')
          setError(undefined) // Clear any previous errors
          setQuizzes(seedQuizzes)
          
          // Try to seed the database for future use
          if (user) {
            await seedDatabase()
          }
          return
        }
        
        // Fetch questions for each quiz
        const completeQuizzes = await Promise.all(
          quizzesData.map(async (quiz) => {
            // Fetch questions for this quiz
            const { data: questionsData, error: questionsError } = await supabase
              .from("questions")
              .select("*")
              .eq("quiz_id", quiz.id)
            
            if (questionsError) {
              console.error(`Error fetching questions for quiz ${quiz.id}:`, questionsError)
              // Return the quiz without questions as fallback
              return {
                id: quiz.id,
                title: quiz.title,
                description: quiz.description,
                createdAt: quiz.created_at,
                createdBy: quiz.created_by,
                category: quiz.category,
                difficulty: quiz.difficulty,
                timeLimit: quiz.time_limit,
                imageUrl: quiz.image_url,
                questions: [] // Empty questions as fallback
              }
            }
            
            // Convert questions from database format to app format
            const formattedQuestions = questionsData.map(q => ({
              id: q.id,
              question: q.question,
              options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
              correctAnswer: q.correct_answer,
              type: q.type,
              timeLimit: q.time_limit
            }))
            
            // Return the complete quiz with questions
            return {
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              createdAt: quiz.created_at,
              createdBy: quiz.created_by,
              category: quiz.category,
              difficulty: quiz.difficulty,
              timeLimit: quiz.time_limit,
              imageUrl: quiz.image_url,
              questions: formattedQuestions
            }
          })
        )
        
        console.log('Successfully fetched quizzes from database:', completeQuizzes.length)
        setError(undefined) // Clear any previous errors
        
        // Validate the quiz data structure
        const validatedQuizzes = validateQuizData(completeQuizzes)
        setQuizzes(validatedQuizzes)
      } catch (error: any) {
        console.error("Error fetching quizzes:", error)
        setError(`Error fetching quizzes: ${error.message || JSON.stringify(error)}`)
        // Fallback to seed data on error
        setQuizzes(seedQuizzes)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuizzes()
  }, [user])

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
    let timer: NodeJS.Timeout | undefined;

    if (quizStarted && selectedQuiz && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, selectedQuiz]);

  const handleStartQuiz = (quiz: Quiz) => {
    // Check if user is authenticated before starting quiz
    if (!user) {
      setError("Please sign in to start a quiz")
      setIsAuthPopupOpen(true)
      return
    }
    
    // Set quiz state
    setSelectedQuiz(quiz)
    setCurrentQuestion(0)
    setAnswers({})
    setQuizCompleted(false)
    setScore(0)
    setQuizStarted(true)
    setActiveTab("quiz")
    setTimeLeft(quiz.timeLimit || 600) // Default to 10 minutes if not specified
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
          timeSpent: selectedQuiz.timeLimit ? selectedQuiz.timeLimit - timeLeft : 0 // Approximate time spent
        }
      })

      const calculatedScore = Math.round((correctAnswers / selectedQuiz.questions.length) * 100)
      setScore(calculatedScore)
      setQuizCompleted(true)
      setQuizStarted(false)
      setActiveTab("dashboard") // Ensure we're on the dashboard tab
      
      // Create the quiz attempt object
      const quizAttempt = {
        id: uuidv4(), // Generate a new UUID for the attempt
        user_id: user.id,
        quiz_id: selectedQuiz.id,
        score: calculatedScore,
        total_questions: selectedQuiz.questions.length,
        completed_at: new Date().toISOString(),
        time_spent: selectedQuiz.timeLimit ? selectedQuiz.timeLimit - timeLeft : 0,
        answers: JSON.stringify(questionResults) // Convert to JSON string for storage
      }

      console.log('Saving quiz result:', quizAttempt);
      
      try {
        // Check if quiz_attempts table exists
        const attemptsTableExists = await tableExists('quiz_attempts')
        
        // If table doesn't exist, create it
        if (!attemptsTableExists) {
          console.log('Quiz attempts table does not exist, creating it...')
          const { error: createTableError } = await createQuizAttemptsTable()
          
          if (createTableError) {
            console.error('Error creating quiz attempts table:', createTableError)
            return
          }
          
          console.log('Successfully created quiz attempts table')
        }
        
        // Insert the quiz attempt
        const { error: submitError } = await supabase
          .from("quiz_attempts")
          .insert([quizAttempt])

        if (submitError) {
          console.error("Error submitting quiz result:", submitError)
        } else {
          console.log("Quiz result saved successfully")
          
          // Update user stats and leaderboard
          fetchUserStats()
          fetchUserProgress()
          fetchLeaderboard()
        }
      } catch (submitError) {
        console.error("Error submitting quiz:", submitError)
      }
    } catch (error) {
      console.error("Error calculating quiz results:", error)
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
      // Check if quiz_attempts table exists
      const attemptsTableExists = await tableExists('quiz_attempts')
      
      if (!attemptsTableExists) {
        console.log('Quiz attempts table does not exist')
        setLeaderboard([])
        return
      }
      
      // First, check if profiles table exists
      const profilesTableExists = await tableExists('profiles')
      
      if (!profilesTableExists) {
        console.log('Profiles table does not exist')
        setLeaderboard([])
        return
      }
      
      // Get all quiz attempts
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('user_id, quiz_id, score, completed_at, time_spent')
      
      if (attemptError || !attemptData || attemptData.length === 0) {
        console.error("Error fetching attempt data:", attemptError)
        setLeaderboard([])
        return
      }
      
      // Group attempts by user and calculate their best scores
      const userScores: Record<string, {
        userId: string,
        totalScore: number,
        quizCount: number,
        bestCompletedAt: string,
        bestTimeSpent: number
      }> = {}
      
      // Process each attempt
      attemptData.forEach(attempt => {
        const userId = attempt.user_id
        
        if (!userScores[userId]) {
          userScores[userId] = {
            userId,
            totalScore: 0,
            quizCount: 0,
            bestCompletedAt: attempt.completed_at,
            bestTimeSpent: attempt.time_spent
          }
        }
        
        // Track unique quizzes per user
        const uniqueQuizzes = new Set()
        attemptData
          .filter(a => a.user_id === userId)
          .forEach(a => uniqueQuizzes.add(a.quiz_id))
        
        // Update user's stats with their best scores
        userScores[userId].quizCount = uniqueQuizzes.size
        
        // Calculate average score for this user
        const userAttempts = attemptData.filter(a => a.user_id === userId)
        const totalScore = userAttempts.reduce((sum, a) => sum + a.score, 0)
        userScores[userId].totalScore = Math.round(totalScore / userAttempts.length)
        
        // Find the most recent attempt with the best score
        const bestAttempt = userAttempts.reduce((best, current) => 
          current.score > best.score ? current : best, userAttempts[0])
        
        userScores[userId].bestCompletedAt = bestAttempt.completed_at
        userScores[userId].bestTimeSpent = bestAttempt.time_spent
      })
      
      // Convert to array and sort by score
      const sortedUsers = Object.values(userScores)
        .sort((a, b) => {
          // First sort by total score
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore
          }
          // Then by number of quizzes completed
          if (b.quizCount !== a.quizCount) {
            return b.quizCount - a.quizCount
          }
          // Finally by time spent (faster is better)
          return a.bestTimeSpent - b.bestTimeSpent
        })
        .slice(0, 10) // Take top 10
      
      // Get user profiles for the leaderboard entries
      const userIds = sortedUsers.map(entry => entry.userId)
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds)
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
      }
      
      // Map the data to the leaderboard format
      const leaderboardData = sortedUsers.map(user => {
        const profile = profilesData?.find(p => p.id === user.userId)
        
        return {
          userId: user.userId,
          displayName: profile?.full_name || "Anonymous User",
          photoUrl: profile?.avatar_url || "",
          score: user.totalScore,
          completedAt: user.bestCompletedAt,
          timeSpent: user.bestTimeSpent
        }
      })
      
      setLeaderboard(leaderboardData)
      
      // Calculate user's rank if they're logged in
      if (user) {
        const userRank = sortedUsers.findIndex(entry => entry.userId === user.id) + 1
        setUserStats(prev => ({ ...prev, rank: userRank > 0 ? userRank : 0 }))
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      setLeaderboard([])
    }
  }
  
  // Function to fetch user stats
  const fetchUserStats = async () => {
    if (!user) return
    
    try {
      // Check if quiz_attempts table exists
      const attemptsTableExists = await tableExists('quiz_attempts')
      
      if (!attemptsTableExists) {
        console.log('Quiz attempts table does not exist')
        setUserStats({
          quizzesTaken: 0,
          avgScore: 0,
          rank: 0,
          badges: 0
        })
        return
      }
      
      // Get user's quiz attempts
      const { data: userAttempts, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select("id, quiz_id, score")
        .eq("user_id", user.id)
      
      if (attemptsError) {
        console.error("Error fetching user attempts:", attemptsError)
        setUserStats({
          quizzesTaken: 0,
          avgScore: 0,
          rank: 0,
          badges: 0
        })
        return
      }
      
      if (userAttempts && userAttempts.length > 0) {
        // Count unique quizzes taken
        const uniqueQuizzes = new Set(userAttempts.map(attempt => attempt.quiz_id)).size
        
        // Calculate average score across all attempts
        const totalScore = userAttempts.reduce((sum, attempt) => sum + attempt.score, 0)
        const avgScore = Math.round(totalScore / userAttempts.length)
        
        // Calculate badges based on quizzes taken and average score
        let badges = 0
        
        // Badge 1: Completed at least 1 quiz
        if (uniqueQuizzes >= 1) badges++
        
        // Badge 2: Completed at least 3 different quizzes
        if (uniqueQuizzes >= 3) badges++
        
        // Badge 3: Completed at least 5 different quizzes
        if (uniqueQuizzes >= 5) badges++
        
        // Badge 4: Average score at least 70%
        if (avgScore >= 70) badges++
        
        // Badge 5: Average score at least 90%
        if (avgScore >= 90) badges++
        
        // Badge 6: Completed at least 10 quiz attempts
        if (userAttempts.length >= 10) badges++
        
        setUserStats({
          quizzesTaken: uniqueQuizzes,
          avgScore,
          rank: userStats.rank || 0, // Keep existing rank
          badges
        })
      } else {
        // No attempts yet
        setUserStats({
          quizzesTaken: 0,
          avgScore: 0,
          rank: 0,
          badges: 0
        })
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      setUserStats({
        quizzesTaken: 0,
        avgScore: 0,
        rank: userStats.rank || 0, // Keep existing rank if available
        badges: 0
      })
    }
  }

  // Function to fetch user progress
  const fetchUserProgress = async () => {
    if (!user) return
    
    try {
      // Check if quiz_attempts table exists
      const attemptsTableExists = await tableExists('quiz_attempts')
      
      if (!attemptsTableExists) {
        console.log('Quiz attempts table does not exist')
        setUserProgress([])
        return
      }
      
      // Get user's quiz attempts directly
      const { data: quizAttempts, error: attemptsError } = await supabase
        .from("quiz_attempts")
        .select("quiz_id, score, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
      
      if (attemptsError || !quizAttempts || quizAttempts.length === 0) {
        console.error("Error fetching user attempts:", attemptsError)
        setUserProgress([])
        return
      }
      
      // Get unique quiz IDs
      const uniqueQuizIds = Array.from(new Set(quizAttempts.map(attempt => attempt.quiz_id)))
      
      // Get best score for each quiz
      const bestAttempts = uniqueQuizIds.map(quizId => {
        const attempts = quizAttempts.filter(attempt => attempt.quiz_id === quizId)
        const bestAttempt = attempts.reduce((best, current) => 
          current.score > best.score ? current : best, attempts[0])
        return bestAttempt
      }).sort((a, b) => b.score - a.score).slice(0, 5) // Sort by score and take top 5
      
      // Get quiz titles
      const quizIds = bestAttempts.map(attempt => attempt.quiz_id)
      const { data: quizData, error: quizzesError } = await supabase
        .from("quizzes")
        .select("id, title")
        .in("id", quizIds)
      
      if (quizzesError || !quizData) {
        console.error("Error fetching quiz data:", quizzesError)
        setUserProgress([])
        return
      }
      
      // Map the data to the progress format
      const progressData = bestAttempts.map(attempt => {
        const quiz = quizData.find(q => q.id === attempt.quiz_id)
        return {
          quizId: attempt.quiz_id,
          title: quiz ? quiz.title : "Unknown Quiz",
          score: attempt.score
        }
      })
      
      setUserProgress(progressData)
    } catch (error) {
      console.error("Error fetching user progress:", error)
      setUserProgress([])
    }
  }

  // Function to handle emergency reset
  const handleEmergencyReset = () => {
    setIsEmergencyResetting(true)
    // Clear all auth data and reload
    localStorage.clear()
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-600/30 rounded-full mx-auto"></div>
            <div className="w-16 h-16 border-4 border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin mx-auto absolute top-0 left-0"></div>
            <div className="w-16 h-16 border-4 border-t-transparent border-r-purple-600 border-b-transparent border-l-purple-600 rounded-full animate-spin mx-auto absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-4 text-white">Loading quiz data...</p>
          <p className="text-white/50 text-sm">Please wait</p>
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
            {/* Dashboard View */}
            {activeTab === "dashboard" && !quizStarted && (
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
                            <div key={index} className="bg-[#131c31]/50 p-3 rounded-lg hover:bg-[#131c31]/70 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-white font-medium">{progress.title}</span>
                                <Badge className={
                                  progress.score >= 90 ? "bg-green-900/50 text-green-300" :
                                  progress.score >= 70 ? "bg-blue-900/50 text-blue-300" :
                                  progress.score >= 50 ? "bg-yellow-900/50 text-yellow-300" :
                                  "bg-red-900/50 text-red-300"
                                }>
                                  {progress.score}%
                                </Badge>
                              </div>
                              <div className="relative pt-1">
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      progress.score >= 90 ? "bg-gradient-to-r from-green-500 to-green-400" :
                                      progress.score >= 70 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                                      progress.score >= 50 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                                      "bg-gradient-to-r from-red-500 to-pink-500"
                                    }`}
                                    style={{ width: `${progress.score}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-white/70">No progress data available yet.</p>
                            <p className="text-white/50 text-sm mt-1">Complete quizzes to see your progress!</p>
                          </div>
                        )}
                      </div>
                      
                      {userProgress.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-indigo-900/30">
                          <div className="flex justify-between items-center text-sm text-white/70">
                            <span>Average Score:</span>
                            <span className="font-medium text-white">
                              {userProgress.length > 0 
                                ? `${Math.round(userProgress.reduce((sum, item) => sum + item.score, 0) / userProgress.length)}%` 
                                : "0%"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-white/70 mt-1">
                            <span>Quizzes Displayed:</span>
                            <span className="font-medium text-white">{userProgress.length}</span>
                          </div>
                        </div>
                      )}
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
                        {leaderboard.map((entry, index) => {
                          const isCurrentUser = user && entry.userId === user.id;
                          return (
                            <div 
                              key={entry.userId} 
                              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                isCurrentUser 
                                  ? 'bg-indigo-900/30 border border-indigo-500/50' 
                                  : 'hover:bg-[#131c31]/50'
                              }`}
                            >
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
                              <Avatar className={`flex-shrink-0 ${isCurrentUser ? 'border-2 border-indigo-500' : 'border-2 border-indigo-500/30'}`}>
                                <AvatarImage src={entry.photoUrl} alt={entry.displayName} />
                                <AvatarFallback>{entry.displayName?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center">
                                  <p className="text-white truncate font-medium">
                                    {entry.displayName}
                                    {isCurrentUser && <span className="ml-1 text-xs text-indigo-400">(You)</span>}
                                  </p>
                                </div>
                                <div className="flex items-center text-white/70 text-xs">
                                  <span className="mr-2">{entry.score}%</span>
                                  <span title="Time taken">⏱️ {Math.floor(entry.timeSpent / 60)}m {entry.timeSpent % 60}s</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 font-bold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded-md">
                                {entry.score}%
                              </div>
                            </div>
                          );
                        })}
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
                      
                      {/* Badges Display */}
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-white/70 mb-2">Your Badges</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Badge 1: Completed at least 1 quiz */}
                          <div 
                            className={`p-2 rounded-lg text-center ${userStats.quizzesTaken >= 1 ? 'bg-indigo-900/50 border border-indigo-500/50' : 'bg-[#131c31]/30 border border-gray-700/30'}`}
                            title="Beginner: Complete at least 1 quiz"
                          >
                            <div className="text-2xl mb-1">🏅</div>
                            <p className={`text-xs ${userStats.quizzesTaken >= 1 ? 'text-white' : 'text-white/30'}`}>Beginner</p>
                          </div>
                          
                          {/* Badge 2: Completed at least 3 different quizzes */}
                          <div 
                            className={`p-2 rounded-lg text-center ${userStats.quizzesTaken >= 3 ? 'bg-indigo-900/50 border border-indigo-500/50' : 'bg-[#131c31]/30 border border-gray-700/30'}`}
                            title="Explorer: Complete at least 3 different quizzes"
                          >
                            <div className="text-2xl mb-1">🔍</div>
                            <p className={`text-xs ${userStats.quizzesTaken >= 3 ? 'text-white' : 'text-white/30'}`}>Explorer</p>
                          </div>
                          
                          {/* Badge 3: Completed at least 5 different quizzes */}
                          <div 
                            className={`p-2 rounded-lg text-center ${userStats.quizzesTaken >= 5 ? 'bg-indigo-900/50 border border-indigo-500/50' : 'bg-[#131c31]/30 border border-gray-700/30'}`}
                            title="Adventurer: Complete at least 5 different quizzes"
                          >
                            <div className="text-2xl mb-1">🌟</div>
                            <p className={`text-xs ${userStats.quizzesTaken >= 5 ? 'text-white' : 'text-white/30'}`}>Adventurer</p>
                          </div>
                          
                          {/* Badge 4: Average score at least 70% */}
                          <div 
                            className={`p-2 rounded-lg text-center ${userStats.avgScore >= 70 ? 'bg-indigo-900/50 border border-indigo-500/50' : 'bg-[#131c31]/30 border border-gray-700/30'}`}
                            title="Scholar: Achieve an average score of at least 70%"
                          >
                            <div className="text-2xl mb-1">📚</div>
                            <p className={`text-xs ${userStats.avgScore >= 70 ? 'text-white' : 'text-white/30'}`}>Scholar</p>
                          </div>
                          
                          {/* Badge 5: Average score at least 90% */}
                          <div 
                            className={`p-2 rounded-lg text-center ${userStats.avgScore >= 90 ? 'bg-indigo-900/50 border border-indigo-500/50' : 'bg-[#131c31]/30 border border-gray-700/30'}`}
                            title="Master: Achieve an average score of at least 90%"
                          >
                            <div className="text-2xl mb-1">🏆</div>
                            <p className={`text-xs ${userStats.avgScore >= 90 ? 'text-white' : 'text-white/30'}`}>Master</p>
                          </div>
                          
                          {/* Badge 6: Completed at least 10 quiz attempts */}
                          <div 
                            className={`p-2 rounded-lg text-center ${userStats.quizzesTaken >= 10 ? 'bg-indigo-900/50 border border-indigo-500/50' : 'bg-[#131c31]/30 border border-gray-700/30'}`}
                            title="Dedicated: Complete at least 10 different quizzes"
                          >
                            <div className="text-2xl mb-1">⭐</div>
                            <p className={`text-xs ${userStats.quizzesTaken >= 10 ? 'text-white' : 'text-white/30'}`}>Dedicated</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Quiz View */}
            {activeTab === "quiz" && quizStarted && selectedQuiz && !quizCompleted && (
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

            {/* Results View */}
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
                    onClick={() => {
                      setActiveTab("dashboard");
                      setQuizCompleted(false);
                      setSelectedQuiz(null);
                      setAnswers({});
                      setScore(0);
                    }}
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
          onClick={handleEmergencyReset}
          disabled={isEmergencyResetting}
          className="bg-red-900/30 border-red-500/50 text-white hover:bg-red-900/50"
        >
          {isEmergencyResetting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting...
            </span>
          ) : "Emergency Reset"}
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

