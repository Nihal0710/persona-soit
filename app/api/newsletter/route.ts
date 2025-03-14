import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingSubscription } = await supabaseAdmin
      .from("newsletter_subscriptions")
      .select()
      .eq("email", email)
      .single()

    if (existingSubscription) {
      if (existingSubscription.status === "unsubscribed") {
        // Reactivate subscription
        const { error: updateError } = await supabaseAdmin
          .from("newsletter_subscriptions")
          .update({ status: "active" })
          .eq("email", email)

        if (updateError) {
          console.error("Error reactivating subscription:", updateError)
          return NextResponse.json(
            { error: "Failed to reactivate subscription. Please try again later." },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
        })
      }

      return NextResponse.json(
        { error: "This email is already subscribed to our newsletter" },
        { status: 400 }
      )
    }

    // Store subscription in Supabase
    const { error } = await supabaseAdmin
      .from("newsletter_subscriptions")
      .insert([{ email }])

    if (error) {
      console.error("Error subscribing to newsletter:", error)
      if (error.code === "42P01") {
        return NextResponse.json(
          { error: "The newsletter subscription system is not set up properly. Please try again later." },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
    })
  } catch (error) {
    console.error("Error in newsletter subscription:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
} 