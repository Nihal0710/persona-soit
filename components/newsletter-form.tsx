"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, X, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function NewsletterForm() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setShowErrorPopup(false)

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
        // Check if it's a duplicate email error
        if (response.status === 409 || data.error?.toLowerCase().includes("already exists")) {
          setErrorMessage("This email is already subscribed to our newsletter.")
        } else {
          setErrorMessage(data.error || "Failed to subscribe. Please try again later.")
        }
        setShowErrorPopup(true)
        
        // Hide error popup after 5 seconds
        setTimeout(() => {
          setShowErrorPopup(false)
        }, 5000)
        
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
      // We're using our custom error popup now, so we don't need the toast
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

      {/* Error Popup with Blur Overlay */}
      <AnimatePresence>
        {showErrorPopup && (
          <>
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowErrorPopup(false)}
            />
            
            {/* Error Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a2234] border border-red-500/30 rounded-lg shadow-lg p-6 max-w-md w-full z-50"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Subscription Failed</h3>
                  <p className="text-white/80 mb-4">{errorMessage}</p>
                  <Button 
                    onClick={() => setShowErrorPopup(false)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 