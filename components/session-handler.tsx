"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

export function SessionHandler() {
  const { session, user } = useAuth()
  const [showExpiredMessage, setShowExpiredMessage] = useState(false)
  const router = useRouter()

  // Check for session expiration
  useEffect(() => {
    if (!session && !user) {
      // Show expired message
      setShowExpiredMessage(true)
      
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowExpiredMessage(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    } else {
      setShowExpiredMessage(false)
    }
  }, [session, user])

  if (!showExpiredMessage) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-50 bg-red-900/80 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md animate-in fade-in slide-in-from-top-5 duration-300">
      <AlertCircle className="h-5 w-5 text-red-300" />
      <div>
        <h4 className="font-medium">Session Expired</h4>
        <p className="text-sm text-white/80">Your session has expired. Please sign in again to continue.</p>
      </div>
    </div>
  )
} 