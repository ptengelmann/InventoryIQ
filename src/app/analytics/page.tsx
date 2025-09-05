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
  ArrowRight,
  FileText,
  TrendingUp
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
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleFileUpload = async (file: File) => {
    console.log('=== UPLOAD DEBUG START ===')
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    if (!user) {
      console.log('❌ No user authenticated')
      setError('User not authenticated')
      return
    }

    setUploadedFile(file)
    setIsAnalyzing(true)
    setError(null)
    setUploadSuccess(false)
    setDebugInfo(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.email)
      formData.append('userEmail', user.email)
      
      console.log('Sending to /api/upload...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      console.log('Upload response status:', response.status)
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()))
      
      const data = await response.json()
      console.log('Upload response data:', data)
      
      // Store debug info regardless of success/failure
      setDebugInfo({
        status: response.status,
        responseData: data,
        timestamp: new Date().toISOString()
      })
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }
      
      // Store results
      setAnalysisResults(data)
      
      // Save analysis ID for redirect
      const uploadId = data.uploadId || data.analysisId
      setAnalysisId(uploadId)
      setUploadSuccess(true)
      
      // Automatically redirect to dashboard after 5 seconds
      setTimeout(() => {
        if (uploadId) {
          router.push(`/dashboard?analysis=${uploadId}`)
        } else {
          router.push('/dashboard')
        }
      }, 5000)
      
    } catch (err) {
      console.error('=== UPLOAD ERROR ===', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setUploadedFile(null)
      
      // Store error in debug info
setDebugInfo((prev: any) => ({
        ...prev,
        error: errorMessage,
        errorDetails: err
      }))
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
    setAnalysisResults(null)
    setDebugInfo(null)
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
            
            {/* Debug information for development */}
            {debugInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                  Show Debug Information
                </summary>
                <pre className="mt-2 p-3 bg-red-100 text-xs overflow-auto rounded text-red-800">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
            
            <button 
              onClick={resetAnalysis}
              className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {uploadSuccess ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Complete!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Your file was successfully analyzed. Redirecting you to the dashboard to view results...
            </p>

            {/* Show quick results preview if available */}
            {analysisResults && (
              <div className="bg-white rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Results Preview:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResults.summary?.totalSKUs || 0}
                    </div>
                    <div className="text-sm text-gray-600">Products Analyzed</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResults.summary?.priceIncreases || 0}
                    </div>
                    <div className="text-sm text-gray-600">Price Opportunities</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-amber-600">
                      {analysisResults.summary?.criticalAlertsGenerated || 0}
                    </div>
                    <div className="text-sm text-gray-600">Critical Alerts</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">
                      £{Math.round(analysisResults.summary?.totalRevenuePotential || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Revenue Potential</div>
                  </div>
                </div>

                {analysisResults.debug && (
                  <div className="mt-4 text-sm text-gray-500">
                    Processing time: {analysisResults.processingTimeMs || 0}ms | 
                    SKUs processed: {analysisResults.debug.validSKUsFound || 0} | 
                    Database: {analysisResults.savedToDatabase ? 'Saved' : 'Not saved'}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={navigateToDashboard}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>View Full Results</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={resetAnalysis}
                className="inline-flex items-center space-x-2 px-6 py-3 text-gray-700 font-medium rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span>Analyze Another File</span>
              </button>
            </div>
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
                  
                  {/* Processing steps indicator */}
                  <div className="max-w-md mx-auto mt-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>CSV Processing</span>
                      <span>AI Analysis</span>
                      <span>Market Data</span>
                      <span>Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-amber-600 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
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

              {/* Additional CSV format examples */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h5 className="font-medium text-gray-900">Alternative Formats</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">We also accept these column names:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• product_id, item_id, code</li>
                    <li>• unit_price, retail_price, cost</li>
                    <li>• sales, units_sold, weekly_units</li>
                    <li>• stock, inventory, qty_on_hand</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h5 className="font-medium text-gray-900">What You'll Get</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Price optimization recommendations</li>
                    <li>• Competitive pricing analysis</li>
                    <li>• Inventory risk alerts</li>
                    <li>• Market positioning insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}