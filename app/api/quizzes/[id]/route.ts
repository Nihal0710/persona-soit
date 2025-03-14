import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: quiz, error: quizError } = await supabase.from("quizzes").select("*").eq("id", params.id).single()

    if (quizError) {
      return NextResponse.json({ error: quizError.message }, { status: 500 })
    }

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", params.id)
      .order("order", { ascending: true })

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 })
    }

    return NextResponse.json({
      ...quiz,
      questions,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}

