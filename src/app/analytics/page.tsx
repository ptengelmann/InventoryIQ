// /src/app/analytics/page.tsx - COMPLETE REPLACEMENT
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
  BarChart3,
  Target,
  Brain,
  Lightbulb,
  Trophy,
  TrendingDown,
  Eye,
  Shield,
  Zap
} from 'lucide-react'

interface PriceRecommendation {
  sku: string
  currentPrice: number
  recommendedPrice: number
  changePercentage: number
  reason: string
  weeklySales: number
  inventoryLevel: number
  revenueImpact?: number
  competitorCount?: number
  brandMatch?: string
  brandConfidence?: number
  marketIntelligence?: {
    brandName: string
    premiumTier: string
    marketShare: number
    brandStrength: string
  }
}

interface CompetitorPrice {
  sku: string
  competitor: string
  competitor_price: number
  our_price: number
  price_difference: number
  price_difference_percentage: number
  availability: boolean
  product_name?: string
  relevance_score?: number
}

interface MarketInsight {
  id: string
  type: 'competitive' | 'seasonal' | 'pricing' | 'portfolio' | 'trend' | 'opportunity'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: {
    revenue_potential?: number
    risk_level: 'low' | 'medium' | 'high'
    time_sensitivity: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  }
  actionable_steps: string[]
  confidence_score: number
  related_products: string[]
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
    brandsIdentified?: number
    competitorPricesFound?: number
    overPricedProducts?: number
    underPricedProducts?: number
    marketInsightsGenerated?: number
  }
  priceRecommendations: PriceRecommendation[]
  inventoryAlerts: any[]
  competitorData?: CompetitorPrice[]
  marketInsights?: MarketInsight[]
  brandIntelligence?: any[]
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
  const [activeTab, setActiveTab] = useState<'recommendations' | 'competitive' | 'insights'>('recommendations')

  const handleFileUpload = async (file: File) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setUploadedFile(file)
    setIsAnalyzing(true)
    setError(null)
    
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
    
    let csvContent = "SKU,Current_Price,Recommended_Price,Change_%,Weekly_Sales,Inventory_Level,Revenue_Impact,Brand_Match,Competitor_Count,Reason\n"
    
    results.priceRecommendations.forEach(rec => {
      csvContent += `${rec.sku},${rec.currentPrice},${rec.recommendedPrice},${rec.changePercentage},${rec.weeklySales},${rec.inventoryLevel},${rec.revenueImpact || 0},${rec.brandMatch || ''},${rec.competitorCount || 0},"${rec.reason}"\n`
    })
    
    if (results.competitorData && results.competitorData.length > 0) {
      csvContent += "\n\nCompetitive Intelligence\n"
      csvContent += "SKU,Our_Price,Competitor,Competitor_Price,Price_Difference_%,Product_Name\n"
      
      results.competitorData.forEach(comp => {
        csvContent += `${comp.sku},${comp.our_price},${comp.competitor},${comp.competitor_price},${comp.price_difference_percentage.toFixed(1)},"${comp.product_name || ''}"\n`
      })
    }
    
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

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
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

        {!uploadedFile && !results ? (
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
        ) : results ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Market Analysis Complete!</h2>
              <p className="text-gray-600 mt-2">Comprehensive alcohol market intelligence for your portfolio.</p>
            </div>

            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-gray-900">{results.summary.totalSKUs}</div>
                <div className="text-xs text-gray-600">SKUs Analyzed</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-600">{results.summary.priceIncreases}</div>
                <div className="text-xs text-gray-600">Price Increases</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-xl font-bold text-purple-600">
                  £{Math.round(results.summary.totalRevenuePotential).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Revenue Potential</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Brain className="h-5 w-5 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-amber-600">{results.summary.brandsIdentified || 0}</div>
                <div className="text-xs text-gray-600">Brands Identified</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-xl font-bold text-indigo-600">{results.summary.competitorPricesFound || 0}</div>
                <div className="text-xs text-gray-600">Competitor Prices</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-xl font-bold text-red-600">{results.summary.marketInsightsGenerated || 0}</div>
                <div className="text-xs text-gray-600">Market Insights</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'recommendations', label: 'Price Recommendations', icon: TrendingUp },
                  { id: 'competitive', label: 'Competitive Intelligence', icon: Target },
                  { id: 'insights', label: 'Market Insights', icon: Lightbulb }
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        isActive
                          ? "border-amber-500 text-amber-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${
                        isActive ? "text-amber-500" : "text-gray-400 group-hover:text-gray-500"
                      }`} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'recommendations' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Price Recommendations */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Top Revenue Opportunities</h3>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {results.priceRecommendations.slice(0, 10).map((rec, index) => (
                      <div key={index} className={`p-4 rounded-xl border ${
                        rec.changePercentage > 0 ? 'bg-green-50 border-green-200' : 
                        rec.changePercentage < 0 ? 'bg-red-50 border-red-200' : 
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900">{rec.sku}</span>
                            {rec.brandMatch && rec.brandMatch !== 'Unknown' && (
                              <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full inline-block ml-2">
                                {rec.brandMatch}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`font-semibold ${
                              rec.changePercentage > 0 ? 'text-green-600' : 
                              rec.changePercentage < 0 ? 'text-red-600' : 
                              'text-blue-600'
                            }`}>
                              {rec.changePercentage > 0 ? '+' : ''}{rec.changePercentage}%
                            </span>
                            {rec.revenueImpact && (
                              <div className="text-xs text-gray-500">
                                £{Math.round(rec.revenueImpact).toLocaleString()} impact
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>£{rec.currentPrice} → £{rec.recommendedPrice}</p>
                          <p className="mt-1">{rec.reason}</p>
                          {rec.competitorCount && rec.competitorCount > 0 && (
                            <p className="text-xs mt-1 flex items-center">
                              <Target className="h-3 w-3 mr-1" />
                              {rec.competitorCount} competitors analyzed
                            </p>
                          )}
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
                    <h3 className="text-xl font-semibold text-gray-900">Priority Alerts</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {results.inventoryAlerts.length > 0 ? results.inventoryAlerts.slice(0, 8).map((alert, index) => (
                      <div key={index} className={`p-4 rounded-xl border ${
                        alert.riskLevel === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{alert.sku}</span>
                          <span className={`font-semibold uppercase text-xs px-2 py-1 rounded ${
                            alert.riskLevel === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                          }`}>
                            {alert.riskLevel} RISK
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{alert.message}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No critical inventory alerts</p>
                        <p className="text-sm">All products have healthy stock levels</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'competitive' && results.competitorData && (
              <div className="space-y-6">
                {/* Competitive Overview */}
                <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-2xl p-6 border border-amber-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Competitive Position Summary</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{results.summary.overPricedProducts || 0}</div>
                      <div className="text-sm text-gray-600">Products Above Market</div>
                      <div className="text-xs text-red-600 mt-1">Competitive risk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{results.summary.underPricedProducts || 0}</div>
                      <div className="text-sm text-gray-600">Products Below Market</div>
                      <div className="text-xs text-green-600 mt-1">Pricing opportunity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{results.summary.competitorPricesFound || 0}</div>
                      <div className="text-sm text-gray-600">Competitor Prices Found</div>
                      <div className="text-xs text-blue-600 mt-1">From UK retailers</div>
                    </div>
                  </div>
                </div>

                {/* Competitive Data Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Competitive Price Analysis</h3>
                    <p className="text-sm text-gray-600">Real-time pricing intelligence from UK alcohol retailers</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Our Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competitor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Their Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.competitorData.slice(0, 15).map((comp, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{comp.sku}</div>
                              {comp.product_name && (
                                <div className="text-sm text-gray-500">{comp.product_name}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-semibold text-gray-900">£{comp.our_price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{comp.competitor}</div>
                              {comp.availability && (
                                <div className="text-xs text-green-600">Available</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-lg font-semibold text-gray-900">£{comp.competitor_price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                comp.price_difference_percentage > 10 ? 'bg-red-100 text-red-800' :
                                comp.price_difference_percentage < -10 ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {comp.price_difference_percentage > 0 ? '+' : ''}{comp.price_difference_percentage.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                £{comp.price_difference.toFixed(2)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && results.marketInsights && (
              <div className="space-y-6">
                {results.marketInsights.slice(0, 6).map((insight, index) => (
                  <div key={index} className={`rounded-2xl p-6 border-2 ${
                    insight.priority === 'critical' ? 'bg-red-50 border-red-200' :
                    insight.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                    insight.priority === 'medium' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          insight.type === 'competitive' ? 'bg-red-100' :
                          insight.type === 'seasonal' ? 'bg-orange-100' :
                          insight.type === 'pricing' ? 'bg-green-100' :
                          insight.type === 'opportunity' ? 'bg-purple-100' :
                          'bg-blue-100'
                        }`}>
                          {insight.type === 'competitive' && <Target className="h-6 w-6 text-red-600" />}
                          {insight.type === 'seasonal' && <TrendingUp className="h-6 w-6 text-orange-600" />}
                          {insight.type === 'pricing' && <DollarSign className="h-6 w-6 text-green-600" />}
                          {insight.type === 'opportunity' && <Lightbulb className="h-6 w-6 text-purple-600" />}
                          {['portfolio', 'trend'].includes(insight.type) && <BarChart3 className="h-6 w-6 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              insight.priority === 'critical' ? 'bg-red-200 text-red-800' :
                              insight.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                              insight.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {insight.priority.toUpperCase()} PRIORITY
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.round(insight.confidence_score * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    
                    {insight.impact.revenue_potential && (
                      <div className="mb-4 p-3 bg-green-100 rounded-lg">
                        <div className="text-sm font-medium text-green-800">
                          Revenue Impact: £{Math.round(insight.impact.revenue_potential).toLocaleString()}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {insight.actionable_steps.slice(0, 3).map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start space-x-2">
                            <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {insight.related_products.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Related products: {insight.related_products.slice(0, 3).join(', ')}
                          {insight.related_products.length > 3 && ` +${insight.related_products.length - 3} more`}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={downloadReport}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Intelligence Report</span>
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