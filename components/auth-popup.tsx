"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: () => void
}

export default function AuthPopup({ isOpen, onClose, onAuthSuccess }: AuthPopupProps) {
  const { signInWithGoogle } = useAuth()
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [authError, setAuthError] = useState("")
  const [authSuccess, setAuthSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Function to handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAuthError("")
    
    try {
      // Validate inputs
      if (!name.trim()) {
        throw new Error("Please enter your full name")
      }
      
      if (!email.trim()) {
        throw new Error("Please enter your email address")
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || null,
            avatar_url: null
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        // Create user profile in the users table
        const { error: profileError } = await supabase.from('users').upsert({
          id: data.user.id,
          display_name: name,
          email: email,
          phone: phone || null,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          quizzes_taken: 0,
          avg_score: 0,
          total_score: 0
        })
        
        if (profileError) {
          console.error("Error creating user profile:", profileError)
        }
        
        // Check if email confirmation is required
        if (data.session) {
          // User is automatically signed in
          
          // Call onAuthSuccess if provided
          if (onAuthSuccess) {
            onAuthSuccess()
          }
          
          // Close popup
          onClose()
          
          // Reset form
          setEmail("")
          setPassword("")
          setName("")
          setPhone("")
        } else {
          // Email confirmation required
          setAuthError("Signup successful! Please check your email to verify your account.")
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      setAuthError(error.message || "Failed to sign up. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Function to handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAuthError("")
    
    try {
      // Validate inputs
      if (!email.trim()) {
        throw new Error("Please enter your email address")
      }
      
      if (!password.trim()) {
        throw new Error("Please enter your password")
      }
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        // Update last login time
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
        
        if (updateError) {
          console.error("Error updating last login:", updateError)
        }
        
        // Call onAuthSuccess if provided
        if (onAuthSuccess) {
          onAuthSuccess()
        }
        
        // Close popup
        onClose()
        
        // Reset form
        setEmail("")
        setPassword("")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setAuthError(error.message || "Failed to log in. Please check your credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle password reset request
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAuthError("")
    setAuthSuccess("")
    
    try {
      // Validate email
      if (!email.trim()) {
        throw new Error("Please enter your email address")
      }
      
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?reset=true`,
      })
      
      if (error) throw error
      
      // Show success message
      setAuthSuccess("Password reset link sent! Please check your email.")
      
      // Clear email field
      setEmail("")
    } catch (error: any) {
      console.error("Password reset error:", error)
      setAuthError(error.message || "Failed to send reset link. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      
      // Call onAuthSuccess if provided
      if (onAuthSuccess) {
        onAuthSuccess()
      }
      
      onClose()
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="max-w-md w-full mx-auto bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Account Access</CardTitle>
                  <div className="flex bg-[#131c31] rounded-lg p-1">
                    <Button 
                      variant={authMode === "login" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => {
                        setAuthMode("login")
                        setAuthError("")
                        setAuthSuccess("")
                      }}
                      className={authMode === "login" ? "bg-indigo-600" : "text-white/70 hover:text-white hover:bg-[#1a2234]"}
                    >
                      Login
                    </Button>
                    <Button 
                      variant={authMode === "signup" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => {
                        setAuthMode("signup")
                        setAuthError("")
                        setAuthSuccess("")
                      }}
                      className={authMode === "signup" ? "bg-indigo-600" : "text-white/70 hover:text-white hover:bg-[#1a2234]"}
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-white/70">
                  {authMode === "login" 
                    ? "Sign in to access your account" 
                    : authMode === "signup" 
                      ? "Create a new account" 
                      : "Reset your password"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authError && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-200 text-sm">
                    {authError}
                  </div>
                )}
                
                {authSuccess && (
                  <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-md text-green-200 text-sm">
                    {authSuccess}
                  </div>
                )}
                
                {authMode === "login" && (
                  <form onSubmit={handleLogin}>
                    <div className="mb-4">
                      <label className="block text-white/70 mb-1 text-sm" htmlFor="email">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 rounded-md bg-[#131c31] border border-indigo-900/50 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-white/70 mb-1 text-sm" htmlFor="password">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 rounded-md bg-[#131c31] border border-indigo-900/50 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="mb-4 text-right">
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-indigo-400 hover:text-indigo-300 text-sm"
                        onClick={() => {
                          setAuthMode("reset")
                          setAuthError("")
                          setAuthSuccess("")
                        }}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white mt-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </span>
                      ) : "Sign In"}
                    </Button>
                  </form>
                )}
                
                {authMode === "signup" && (
                  <form onSubmit={handleSignup}>
                    <div className="mb-4">
                      <label className="block text-white/70 mb-1 text-sm" htmlFor="name">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-2 rounded-md bg-[#131c31] border border-indigo-900/50 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                      
                    <div className="mb-4">
                      <label className="block text-white/70 mb-1 text-sm" htmlFor="email">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 rounded-md bg-[#131c31] border border-indigo-900/50 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                      
                    <div className="mb-4">
                      <label className="block text-white/70 mb-1 text-sm" htmlFor="password">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full p-2 rounded-md bg-[#131c31] border border-indigo-900/50 text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <p className="text-white/50 text-xs mt-1">Password must be at least 6 characters long</p>
                    </div>
                      
                    <div className="mb-4">
                      <label className="block text-white/70 mb-1 text-sm" htmlFor="phone">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2 rounded-md bg-[#131c31] border border-indigo-900/50 text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                      
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white mt-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : "Create Account"}
                    </Button>
                  </form>
                )}
                
                {authMode === "reset" && (
                  <form onSubmit={handlePasswordReset}>
                    <div className="mb-4">
                      <label className="block text-white/70 mb-1 text-sm" htmlFor="reset-email">
                        Email Address
                      </label>
                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 rounded-md bg-[#131c31] border border-indigo-900/50 text-white focus:border-indigo-500 focus:outline-none"
                      />
                      <p className="text-white/50 text-xs mt-1">We'll send a password reset link to this email</p>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white mt-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Reset Link...
                        </span>
                      ) : "Send Reset Link"}
                    </Button>
                    
                    <div className="mt-4 text-center">
                      <Button 
                        type="button"
                        variant="link" 
                        className="text-indigo-400 hover:text-indigo-300 p-0"
                        onClick={() => {
                          setAuthMode("login")
                          setAuthError("")
                          setAuthSuccess("")
                        }}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                )}
                
                <div className="mt-6 text-center">
                  <p className="text-white/50 text-sm mb-4">Or continue with</p>
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full border-indigo-900/50 text-white hover:bg-indigo-900/30"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="link" 
                    className="text-indigo-400 hover:text-indigo-300 p-0"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 