import { supabase } from './supabase'

/**
 * Clears all authentication data from local storage
 */
export const clearAuthData = () => {
  // Clear Supabase auth data
  localStorage.removeItem('supabase.auth.token')
  localStorage.removeItem('supabase.auth.expires_at')
  
  // Clear any other auth-related items
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('auth'))) {
      keysToRemove.push(key)
    }
  }
  
  // Remove the collected keys
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

/**
 * Force logout the user and clear all session data
 */
export const forceLogout = async () => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut({ scope: 'global' })
    
    // Clear local storage
    clearAuthData()
    
    // Redirect to the home page
    window.location.href = '/'
  } catch (error) {
    console.error('Error during force logout:', error)
    
    // Even if there's an error, try to clear data and redirect
    clearAuthData()
    window.location.href = '/'
  }
} 