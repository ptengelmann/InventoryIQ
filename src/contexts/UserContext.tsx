'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id?: string  // Add ID from JWT
  name: string
  email: string
  company?: string
  phone?: string
  location?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (userData: User) => void
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('inventoryiq_user')
      const savedToken = localStorage.getItem('auth_token')

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)

        // If we have a token, verify it's still valid
        if (savedToken) {
          // Token validation happens automatically via middleware
          // If token is invalid, middleware will return 401 and user will be logged out
          console.log('✅ User restored from localStorage:', parsedUser.email)
        }
      }
    } catch (error) {
      console.error('Error parsing saved user:', error)
      localStorage.removeItem('inventoryiq_user')
      localStorage.removeItem('auth_token')
    }
    setIsLoading(false)
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('inventoryiq_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('inventoryiq_user')
      localStorage.removeItem('auth_token')
    }
  }, [user])

  const login = (userData: User) => {
    setUser(userData)
    console.log('✅ User logged in:', userData.email)
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear HTTP-only cookie
      await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear local state regardless of API success
      setUser(null)
      localStorage.removeItem('inventoryiq_user')
      localStorage.removeItem('auth_token')
      console.log('✅ User logged out')
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}