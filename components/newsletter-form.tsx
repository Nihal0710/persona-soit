"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function NewsletterForm() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      // Reset form on success
      setEmail("")
      
      // Show success popup instead of toast
      setShowSuccessPopup(true)
      
      // Hide popup after 5 seconds
      setTimeout(() => {
        setShowSuccessPopup(false)
      }, 5000)
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            placeholder="Your Email"
            className="bg-[#131c31] border-indigo-900/30 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            disabled={isSubmitting}
            aria-describedby={error ? "email-error" : undefined}
          />
          {error && (
            <p id="email-error" className="mt-1 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-lg max-w-md z-50"
          >
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Subscription Successful!</h3>
                <p className="text-white/90">
                  Thank you for subscribing to our newsletter. You'll receive updates about new quizzes and features.
                </p>
              </div>
              <button 
                onClick={() => setShowSuccessPopup(false)}
                className="ml-4 text-white/80 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 