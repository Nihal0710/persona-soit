"use client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Quiz } from "@/types/quiz"
import { Clock, Users } from "lucide-react"

interface QuizCardProps {
  quiz: Quiz
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const router = useRouter()

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="bg-[#1a2234] border-indigo-900/20 h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2 bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/70">{quiz.category}</Badge>
              <CardTitle className="text-white">{quiz.title}</CardTitle>
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
          <CardDescription className="text-white/70">{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center justify-between text-sm text-white/70 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{quiz.timeLimit}s</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{quiz.questions.length} questions</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            onClick={() => router.push(`/quiz/${quiz.id}`)}
          >
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

