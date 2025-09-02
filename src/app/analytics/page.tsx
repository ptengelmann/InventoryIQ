// src/app/analytics/page.tsx - UPDATED VERSION
'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { FileUpload } from '@/components/ui/file-upload'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  AlertTriangle, 
  Brain,
  Upload,
  Package,
  CheckCircle,
  Loader,
  ArrowRight
} from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setUploadedFile(file)
    setIsAnalyzing(true)
    setError(null)
    setUploadSuccess(false)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.email)
      formData.append('userEmail', user.email)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file')
      }
      
      // Save analysis ID for redirect
      setAnalysisId(data.analysisId)
      setUploadSuccess(true)
      
      // Automatically redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push(`/dashboard?analysis=${data.analysisId}`)
      }, 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setUploadedFile(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setUploadedFile(null)
    setUploadSuccess(false)
    setError(null)
    setIsAnalyzing(false)
    setAnalysisId(null)
  }

  const handleLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleSignup = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = (userData: any) => {
    login(userData)
    setAuthModalOpen(false)
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  const navigateToDashboard = () => {
    if (analysisId) {
      router.push(`/dashboard?analysis=${analysisId}`)
    } else {
      router.push('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onSwitchMode={switchAuthMode}
          onSuccess={handleAuthSuccess}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Access Required</h2>
            <p className="text-gray-600">Please sign in to access the Analytics dashboard.</p>
            <button
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alcohol Market Intelligence</h1>
          <p className="text-gray-600 mt-2">Upload your inventory data and get AI-powered recommendations with competitive insights.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Error Processing File</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button 
              onClick={resetAnalysis}
              className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {uploadSuccess ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Complete!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your file was successfully analyzed. Redirecting you to the dashboard to view results...
            </p>
            <button
              onClick={navigateToDashboard}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>View Results Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        ) : isAnalyzing ? (
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Analyzing Your Alcohol Portfolio...</h2>
            <p className="text-gray-600">Our AI is identifying brands, analyzing competitive pricing, and generating market insights.</p>
            
            <div className="flex justify-center">
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-gray-600">Processing {uploadedFile?.name}...</p>
                  <p className="text-sm text-gray-500">Identifying alcohol brands and competitive pricing...</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Your Alcohol Inventory
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get instant AI-powered price recommendations, competitive intelligence, 
                and market insights for your alcohol business.
              </p>
            </div>

            <FileUpload 
              onFileUpload={handleFileUpload}
              className="max-w-3xl mx-auto"
            />

            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-xl p-6 border border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-3">Expected CSV Format:</h4>
                <div className="bg-white rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-600">SKU,Price,Weekly_Sales,Inventory_Level</div>
                  <div className="text-gray-900">Hendricks-Gin,42.99,8,45</div>
                  <div className="text-gray-900">Macallan-12,89.99,3,12</div>
                  <div className="text-gray-900">Punk-IPA,3.99,25,120</div>
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  Our AI will identify alcohol brands and provide competitive pricing from UK retailers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}