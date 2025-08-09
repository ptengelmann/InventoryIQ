'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
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
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Error parsing saved user:', error)
      localStorage.removeItem('inventoryiq_user')
    }
    setIsLoading(false)
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('inventoryiq_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('inventoryiq_user')
    }
  }, [user])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
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