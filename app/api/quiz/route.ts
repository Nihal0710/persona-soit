import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
}

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    // Get quizzes from Supabase
    const { data, error } = await supabase.from("quizzes").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ quizzes: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, quizId, score, answers } = body

    // Save quiz result to Supabase
    const { data, error } = await supabase
      .from("quiz_results")
      .insert([{ user_id: userId, quiz_id: quizId, score, answers }])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update leaderboard
    await updateLeaderboard(userId, score)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

async function updateLeaderboard(userId: string, score: number) {
  // Get current user stats
  const { data: userData } = await supabase.from("users").select("total_score, quizzes_taken").eq("id", userId).single()

  if (userData) {
    // Update user stats
    const newTotalScore = (userData.total_score || 0) + score
    const newQuizzesTaken = (userData.quizzes_taken || 0) + 1
    const newAvgScore = Math.round(newTotalScore / newQuizzesTaken)

    await supabase
      .from("users")
      .update({
        total_score: newTotalScore,
        quizzes_taken: newQuizzesTaken,
        avg_score: newAvgScore,
        last_quiz_date: new Date().toISOString(),
      })
      .eq("id", userId)
  }
}

