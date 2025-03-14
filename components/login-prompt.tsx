"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"

export default function LoginPrompt() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[#1a2234] border-indigo-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Sign in to access quizzes</CardTitle>
          <CardDescription className="text-white/70">
            You need to be signed in to take quizzes and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/personalogo.jpg-GdsYkYNMf4zntjjLwNSjCeX2jMSltt.jpeg"
            alt="Persona Logo"
            className="w-24 h-24 rounded-full"
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800"
            onClick={signInWithGoogle}
          >
            <FcGoogle className="w-5 h-5" />
            <span>Sign in with Google</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

