'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { FileUpload } from '@/components/ui/file-upload'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  AlertTriangle, 
  Download, 
  DollarSign, 
  Package, 
  TrendingUp,
  Upload,
  BarChart3
} from 'lucide-react'

interface User {
  name: string
  email: string
}

interface PriceRecommendation {
  sku: string
  currentPrice: number
  recommendedPrice: number
  changePercentage: number
  reason: string
  weeklySales: number
  inventoryLevel: number
}

interface InventoryAlert {
  sku: string
  riskLevel: 'low' | 'medium' | 'high'
  riskType: 'stockout' | 'overstock' | 'none'
  weeksOfStock: number
  priority: number
  message: string
}

interface AnalysisResults {
  summary: {
    totalSKUs: number
    priceIncreases: number
    priceDecreases: number
    noChange: number
    highRiskSKUs: number
    mediumRiskSKUs: number
    totalRevenuePotential: number
  }
  priceRecommendations: PriceRecommendation[]
  inventoryAlerts: InventoryAlert[]
  processedAt: string
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file)
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file')
      }
      
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setUploadedFile(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadReport = () => {
    if (!results) return
    
    let csvContent = "SKU,Current_Price,Recommended_Price,Change_%,Weekly_Sales,Inventory_Level,Reason\n"
    
    results.priceRecommendations.forEach(rec => {
      csvContent += `${rec.sku},${rec.currentPrice},${rec.recommendedPrice},${rec.changePercentage},${rec.weeklySales},${rec.inventoryLevel},"${rec.reason}"\n`
    })
    
    csvContent += "\n\nInventory Alerts\n"
    csvContent += "SKU,Risk_Level,Risk_Type,Weeks_of_Stock,Message\n"
    
    results.inventoryAlerts.forEach(alert => {
      csvContent += `${alert.sku},${alert.riskLevel},${alert.riskType},${alert.weeksOfStock},"${alert.message}"\n`
    })
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-analysis-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetAnalysis = () => {
    setUploadedFile(null)
    setResults(null)
    setError(null)
    setIsAnalyzing(false)
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

  const handleLogout = () => {
    router.push('/')
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  // Show loading state
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

  // Redirect to auth if not logged in
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Upload your inventory data and get AI-powered recommendations.</p>
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

        {!uploadedFile && !results ? (
          /* Upload State */
          <div className="space-y-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Your Inventory Data
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get instant AI-powered price recommendations and inventory risk alerts 
                to optimize your e-commerce performance.
              </p>
            </div>

            <FileUpload 
              onFileUpload={handleFileUpload}
              className="max-w-3xl mx-auto"
            />

            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <h4 className="font-semibold text-gray-900 mb-3">Expected CSV Format:</h4>
                <div className="bg-white rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-600">SKU,Price,Weekly_Sales,Inventory_Level</div>
                  <div className="text-gray-900">ABC123,29.99,45,120</div>
                  <div className="text-gray-900">XYZ789,15.50,23,89</div>
                  <div className="text-gray-900">DEF456,99.00,12,45</div>
                </div>
              </div>
            </div>
          </div>
        ) : isAnalyzing ? (
          /* Loading State */
          <div className="text-center space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Analyzing Your Data...</h2>
            <p className="text-gray-600">Our AI is processing your inventory data and generating recommendations.</p>
            
            <div className="flex justify-center">
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-gray-600">Processing {uploadedFile?.name}...</p>
                  <p className="text-sm text-gray-500">Analyzing price optimization opportunities...</p>
                </div>
              </div>
            </div>
          </div>
        ) : results ? (
          /* Results State */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Complete!</h2>
              <p className="text-gray-600 mt-2">Here are your personalized insights and recommendations.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{results.summary.totalSKUs}</div>
                <div className="text-sm text-gray-600">SKUs Analyzed</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{results.summary.priceIncreases}</div>
                <div className="text-sm text-gray-600">Price Increases</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{results.summary.highRiskSKUs}</div>
                <div className="text-sm text-gray-600">High Risk SKUs</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round(results.summary.totalRevenuePotential)}
                </div>
                <div className="text-sm text-gray-600">Weekly Revenue Potential</div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Price Recommendations */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Top Price Recommendations</h3>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.priceRecommendations.slice(0, 10).map((rec, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${
                      rec.changePercentage > 0 ? 'bg-green-50 border-green-200' : 
                      rec.changePercentage < 0 ? 'bg-red-50 border-red-200' : 
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{rec.sku}</span>
                        <span className={`font-semibold ${
                          rec.changePercentage > 0 ? 'text-green-600' : 
                          rec.changePercentage < 0 ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {rec.changePercentage > 0 ? '+' : ''}{rec.changePercentage}%
                          {rec.changePercentage > 0 ? ' ↗' : rec.changePercentage < 0 ? ' ↘' : ' →'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>${rec.currentPrice} → ${rec.recommendedPrice}</p>
                        <p className="mt-1">{rec.reason}</p>
                        <p className="text-xs mt-1">Sales: {rec.weeklySales}/week, Stock: {rec.inventoryLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Alerts */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Priority Inventory Alerts</h3>
                </div>
                
                <div className="space-y-4">
                  {results.inventoryAlerts.length > 0 ? results.inventoryAlerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${
                      alert.riskLevel === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{alert.sku}</span>
                        <span className={`font-semibold uppercase text-xs ${
                          alert.riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {alert.riskLevel} RISK
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{alert.message}</p>
                        <p className="text-xs mt-1">
                          {alert.riskType === 'stockout' ? '⚠️ Reorder immediately' : '📦 Consider promotion'}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No critical inventory alerts</p>
                      <p className="text-sm">All SKUs have healthy stock levels</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={downloadReport}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Report</span>
                </button>
                
                <button 
                  onClick={resetAnalysis}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>New Analysis</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}