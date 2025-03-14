"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-[#1a2234] border-indigo-900/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-white">Authentication Error</CardTitle>
          <CardDescription className="text-white/70">
            There was a problem with the authentication process
          </CardDescription>
        </CardHeader>
        <CardContent className="text-white/80">
          <p>This could be due to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Missing or incorrect environment variables</li>
            <li>Misconfigured OAuth settings in Supabase or Google</li>
            <li>Network connectivity issues</li>
            <li>Session token problems</li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            asChild
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </Button>
          <Button
            className="w-full flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800"
            onClick={() => window.location.reload()}
          >
            <span>Try Again</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 