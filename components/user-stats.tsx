"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface UserStatsProps {
  stats: {
    totalQuizzes: number
    totalQuestions: number
    correctAnswers: number
    averageScore: number
    quizzesByCategory: {
      category: string
      count: number
    }[]
    scoreHistory: {
      date: string
      score: number
      total: number
    }[]
  } | null
}

export default function UserStats({ stats }: UserStatsProps) {
  if (!stats) {
    return (
      <div className="text-center py-8 text-white/70">
        You haven't completed any quizzes yet. Start a quiz to see your stats!
      </div>
    )
  }

  const { totalQuizzes, totalQuestions, correctAnswers, averageScore, quizzesByCategory, scoreHistory } = stats

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

  const chartData = scoreHistory.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    score: (item.score / item.total) * 100,
  }))

  const categoryData = quizzesByCategory.map((item) => ({
    category: item.category,
    count: item.count,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-indigo-900/20 border-indigo-900/30">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-white/70">Quizzes Taken</div>
            <div className="text-2xl font-bold text-white mt-1">{totalQuizzes}</div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-900/20 border-indigo-900/30">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-white/70">Questions Answered</div>
            <div className="text-2xl font-bold text-white mt-1">{totalQuestions}</div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-900/20 border-indigo-900/30">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-white/70">Average Score</div>
            <div className="text-2xl font-bold text-white mt-1">{averageScore.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-900/20 border-indigo-900/30">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-white/70">Accuracy</div>
            <div className="text-2xl font-bold text-white mt-1">{accuracy.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 bg-[#131c31]">
          <TabsTrigger value="progress" className="data-[state=active]:bg-indigo-900/50">
            Progress
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-indigo-900/50">
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card className="bg-indigo-900/10 border-indigo-900/30">
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} axisLine={{ stroke: "#334155" }} />
                    <YAxis
                      tick={{ fill: "#94a3b8" }}
                      axisLine={{ stroke: "#334155" }}
                      domain={[0, 100]}
                      label={{
                        value: "Score (%)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#94a3b8",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="bg-indigo-900/10 border-indigo-900/30">
            <CardContent className="p-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" tick={{ fill: "#94a3b8" }} axisLine={{ stroke: "#334155" }} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fill: "#94a3b8" }}
                      axisLine={{ stroke: "#334155" }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "6px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

