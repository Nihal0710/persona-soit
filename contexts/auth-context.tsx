"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { clearAuthData } from "@/lib/auth-utils"
import type { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  checkSession: async () => false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to handle session expiration
  const handleSessionExpiration = () => {
    setUser(null)
    setSession(null)
    // Redirect to the home page
    router.push('/')
  }

  // Function to check if session is valid
  const checkSession = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        // Session is invalid or expired
        setUser(null)
        setSession(null)
        return false
      }
      
      // Update session and user data
      setSession(data.session)
      setUser(data.session.user)
      return true
    } catch (error) {
      console.error("Error checking session:", error)
      setUser(null)
      setSession(null)
      return false
    }
  }

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        setUser(data.session?.user ?? null)
      } catch (error) {
        console.error("Error getting session:", error)
        handleSessionExpiration()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // If session is null (expired or logged out), redirect to home
      if (!session) {
        handleSessionExpiration()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signInWithGoogle = async () => {
    try {
      // Use the callback on localhost, but it will redirect to Vercel after auth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) throw error
    } catch (error) {
      console.error("Error signing in with Google", error)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Clear local state first
      setUser(null)
      setSession(null)
      
      // Sign out from Supabase with global scope to invalidate all sessions
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear all auth data from local storage
      clearAuthData()
      
      // Redirect to the home page
      window.location.href = '/'
    } catch (error) {
      console.error("Error signing out", error)
      
      // Even if there's an error, try to clear state
      setUser(null)
      setSession(null)
      clearAuthData()
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

