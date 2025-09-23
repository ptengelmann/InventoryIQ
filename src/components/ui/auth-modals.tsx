'use client'

import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'signup' | 'reset'
  onSwitchMode: () => void
  onSwitchToReset?: () => void
  onSuccess: (user: { name: string; email: string }) => void
}

export function AuthModal({ isOpen, onClose, mode, onSwitchMode, onSwitchToReset, onSuccess }: AuthModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetEmail: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
    setResetMessage('')
  }

  const handleForgotPassword = () => {
    // Copy current email to resetEmail field
    setFormData(prev => ({ ...prev, resetEmail: prev.email }))
    // Switch to reset mode using the new handler
    if (onSwitchToReset) {
      onSwitchToReset()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResetMessage('')

    try {
      if (mode === 'reset') {
        // Handle password reset request
        if (!formData.resetEmail.trim()) {
          throw new Error('Email is required')
        }

        if (!formData.resetEmail.includes('@')) {
          throw new Error('Please enter a valid email')
        }

        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'request',
            email: formData.resetEmail
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send reset email')
        }

        setResetMessage('A password reset link has been sent to your email address.')
        return
      }

      // Original login/signup logic
      if (mode === 'signup') {
        if (!formData.name.trim()) {
          throw new Error('Name is required')
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email')
      }

      // REAL API call to database
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Success - user is now in database
      onSuccess(data.user)
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        resetEmail: ''
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 rounded-lg w-full max-w-md relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white/60" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white">
                {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Get started' : 'Reset password'}
              </h2>
              <p className="text-sm text-white/60">
                {mode === 'login' 
                  ? 'Sign in to your account' 
                  : mode === 'signup' 
                  ? 'Create your OscarAI account'
                  : 'Enter your email to receive a reset link'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {resetMessage && (
            <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
              <p className="text-green-400 text-sm">{resetMessage}</p>
            </div>
          )}

          {mode === 'reset' ? (
            // Password Reset Form
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  name="resetEmail"
                  value={formData.resetEmail}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>
          ) : (
            // Login/Signup Forms
            <>
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm text-white/70 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5 text-white focus:ring-white/20" />
                    <span className="ml-2 text-white/60">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-white/80 hover:text-white"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              "w-full bg-white text-black py-3 rounded font-medium transition-all duration-200",
              isLoading 
                ? "opacity-70 cursor-not-allowed" 
                : "hover:bg-gray-100"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {mode === 'login' ? 'Signing In...' : mode === 'signup' ? 'Creating Account...' : 'Sending Reset Link...'}
                </span>
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
            )}
          </button>

          {mode !== 'reset' ? (
            <div className="text-center text-sm text-white/60">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-white/80 hover:text-white"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          ) : (
            <div className="text-center text-sm text-white/60">
              Remember your password?{' '}
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-white/80 hover:text-white"
              >
                Back to sign in
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <p className="text-xs text-white/50 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-white/70 hover:text-white">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-white/70 hover:text-white">Privacy Policy</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}