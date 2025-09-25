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
  TrendingUp,
  Activity
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
      <div className="min-h-screen bg-black">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
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
            <h2 className="text-3xl font-light text-white">Access Required</h2>
            <p className="text-white/60">Please sign in to access the Analytics dashboard.</p>
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 border border-white/20 rounded mb-8">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-white/60 text-sm">AI-powered inventory analysis</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-light text-white leading-tight mb-8">
            Complete inventory intelligence
            <br />
            <span className="text-white/60">for your alcohol business</span>
          </h1>

          <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl">
            Upload your inventory CSV and get AI-powered pricing recommendations, 
            competitive analysis, and strategic insights across 20+ UK retailers.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="font-medium text-red-300">Error Processing File</h3>
            </div>
            <p className="text-red-200 mb-4">{error}</p>
            
            {/* Debug information for development */}
            {debugInfo && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-red-300 hover:text-red-100">
                  Show Debug Information
                </summary>
                <pre className="mt-3 p-4 bg-red-500/5 border border-red-500/20 text-xs overflow-auto rounded text-red-200 font-mono">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
            
            <button 
              onClick={resetAnalysis}
              className="text-red-300 hover:text-red-100 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {uploadSuccess ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8 text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-light text-white mb-4">Analysis Complete!</h2>
            <p className="text-lg text-white/60 mb-6">
              Your file was successfully analyzed. Redirecting you to the dashboard to view results...
            </p>

            {/* Show quick results preview if available */}
            {analysisResults && (
              <div className="bg-white/5 border border-white/20 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-medium text-white mb-4">Quick Results Preview:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/5 border border-white/20 rounded p-4">
                    <div className="text-2xl font-light text-white">
                      {analysisResults.summary?.totalSKUs || 0}
                    </div>
                    <div className="text-sm text-white/60">Products Analyzed</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
                    <div className="text-2xl font-light text-green-400">
                      {analysisResults.summary?.priceIncreases || 0}
                    </div>
                    <div className="text-sm text-green-300">Price Opportunities</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded p-4">
                    <div className="text-2xl font-light text-orange-400">
                      {analysisResults.summary?.criticalAlertsGenerated || 0}
                    </div>
                    <div className="text-sm text-orange-300">Critical Alerts</div>
                  </div>
                  <div className="bg-white/5 border border-white/20 rounded p-4">
                    <div className="text-2xl font-light text-white">
                      £{Math.round(analysisResults.summary?.totalRevenuePotential || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-white/60">Revenue Potential</div>
                  </div>
                </div>

                {analysisResults.debug && (
                  <div className="mt-4 text-sm text-white/50 font-mono">
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
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
              >
                <span>View Full Results</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={resetAnalysis}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 text-white border border-white/20 font-medium rounded hover:bg-white/15 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span>Analyze Another File</span>
              </button>
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-light text-white">Analyzing your alcohol portfolio...</h2>
            <p className="text-white/60">Our AI is identifying brands, analyzing competitive pricing, and generating market insights.</p>
            
            <div className="flex justify-center">
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-white/80">Processing {uploadedFile?.name}...</p>
                  <p className="text-sm text-white/50">Identifying alcohol brands and competitive pricing...</p>
                  
                  {/* Processing steps indicator */}
                  <div className="max-w-md mx-auto mt-6">
                    <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                      <span>CSV Processing</span>
                      <span>AI Analysis</span>
                      <span>Market Data</span>
                      <span>Complete</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white/10 rounded flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-white/60" />
              </div>
              <h2 className="text-2xl md:text-3xl font-light text-white leading-tight mb-4">
                Upload inventory file
              </h2>
              <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
                CSV analysis with real-time competitive pricing and 
                strategic recommendations from our AI engine.
              </p>
            </div>

            <FileUpload 
              onFileUpload={handleFileUpload}
              className="max-w-3xl mx-auto"
            />

            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <h4 className="font-medium text-white mb-3">Expected CSV Format:</h4>
                <div className="bg-white/5 border border-white/20 rounded p-4 font-mono text-sm">
                  <div className="text-white/60">SKU,Price,Weekly_Sales,Inventory_Level</div>
                  <div className="text-white">Hendricks-Gin,42.99,8,45</div>
                  <div className="text-white">Macallan-12,89.99,3,12</div>
                  <div className="text-white">Punk-IPA,3.99,25,120</div>
                </div>
                <p className="text-sm text-white/60 mt-3">
                  Our AI will identify alcohol brands and provide competitive pricing from UK retailers.
                </p>
              </div>

              {/* Additional CSV format examples */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-5 w-5 text-white/60" />
                    <h5 className="font-medium text-white">Alternative Formats</h5>
                  </div>
                  <p className="text-sm text-white/60 mb-2">We also accept these column names:</p>
                  <ul className="text-xs text-white/50 space-y-1">
                    <li>• product_id, item_id, code</li>
                    <li>• unit_price, retail_price, cost</li>
                    <li>• sales, units_sold, weekly_units</li>
                    <li>• stock, inventory, qty_on_hand</li>
                  </ul>
                </div>
                
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Activity className="h-5 w-5 text-green-400" />
                    <h5 className="font-medium text-white">What You'll Get</h5>
                  </div>
                  <ul className="text-sm text-white/60 space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full" />
                      <span>Price optimization recommendations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full" />
                      <span>Competitive pricing analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full" />
                      <span>Inventory risk alerts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full" />
                      <span>Market positioning insights</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Live Intelligence Preview */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <div className="text-xs text-white/60 mb-3">Live intelligence dashboard preview:</div>
              
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-red-300 text-xs font-medium">Price Alert • 2 mins ago</span>
                  </div>
                  <div className="text-white text-xs">Grey Goose 70cl dropped to £24.99 at Tesco</div>
                  <div className="text-white/60 text-xs">Previously £28.50 • 12% decrease</div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                    <span className="text-orange-300 text-xs font-medium">Stock Alert • 5 mins ago</span>
                  </div>
                  <div className="text-white text-xs">Belvedere 70cl out of stock at Majestic Wine</div>
                  <div className="text-white/60 text-xs">Opportunity detected for premium vodka</div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-300 text-xs font-medium">AI Recommendation • 15 mins ago</span>
                  </div>
                  <div className="text-white text-xs">Lower your gin price by £3 at Waitrose</div>
                  <div className="text-white/60 text-xs">Est. 23% sales increase based on elasticity data</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}