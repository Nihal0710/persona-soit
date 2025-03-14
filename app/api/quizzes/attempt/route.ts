import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { quizId, userId, score, totalQuestions, timeSpent, answers } = body

    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert([
        {
          quiz_id: quizId,
          user_id: userId,
          score,
          total_questions: totalQuestions,
          time_spent: timeSpent,
          answers,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to save quiz attempt" }, { status: 500 })
  }
}

