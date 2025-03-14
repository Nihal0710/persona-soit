import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: {
            name: !name ? "Name is required" : null,
            email: !email ? "Email is required" : null,
            message: !message ? "Message is required" : null
          }
        }, 
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: { 
            email: "Please enter a valid email address" 
          }
        }, 
        { status: 400 }
      )
    }

    // Store contact submission in Supabase
    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .insert([
        { 
          name, 
          email, 
          message, 
          created_at: new Date().toISOString() 
        }
      ])
      .select()

    if (error) {
      console.error("Error submitting contact form:", error)
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "The contact submissions system is not set up properly. Please try again later." }, 
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: "Failed to submit contact form. Please try again later." }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
      data,
    })
  } catch (error) {
    console.error("Error in contact form submission:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." }, 
      { status: 500 }
    )
  }
}

