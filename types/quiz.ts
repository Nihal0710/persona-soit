export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  type: "mcq" | "true-false"
  timeLimit: number // in seconds
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
  createdBy: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  timeLimit: number // in seconds
  imageUrl?: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  score: number
  totalQuestions: number
  completedAt: string
  timeSpent: number // in seconds
  answers: {
    questionId: string
    selectedAnswer: string
    isCorrect: boolean
    timeSpent: number // in seconds
  }[]
}

export interface LeaderboardEntry {
  userId: string
  displayName: string
  photoUrl: string
  score: number
  completedAt: string
  timeSpent: number
}

