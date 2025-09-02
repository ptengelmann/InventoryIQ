// src/app/dashboard/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Upload,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  Filter,
  Eye,
  RefreshCw,
  Target,
  Brain,
  Lightbulb,
  FileText,
  ArrowRight,
  Zap
} from 'lucide-react'

interface DashboardStats {
  totalAnalyses: number
  totalSKUs: number
  totalRevenuePotential: number
  avgSKUsPerAnalysis: number
  recentAnalyses: number
}

interface Analysis {
  _id: string
  uploadId: string
  fileName: string
  uploadedAt: string
  processedAt: string
  summary: any
  recommendations?: any[]
  alerts?: any[]
}

interface AnalysisDetails {
  analysisId: string
  summary: {
    totalSKUs: number
    priceIncreases: number
    priceDecreases: number
    noChange: number
    totalRevenuePotential: number
    brandsIdentified?: number
    competitorPricesFound?: number
    marketInsightsGenerated?: number
  }
  recommendations: any[]
  competitorData: any[]
  marketInsights: any[]
  criticalAlerts: any[]
  processedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login, isLoading } = useUser()
  
  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Auth state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'analyses' | 'alerts'>('overview')
  
  // Analysis details state
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null)
  const [loadingAnalysisDetails, setLoadingAnalysisDetails] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<'recommendations' | 'competitive' | 'insights'>('recommendations')
  
  // Check for analysis parameter in URL
  useEffect(() => {
    if (searchParams) {
      const analysisParam = searchParams.get('analysis')
      if (analysisParam && analysisParam !== 'undefined' && analysisParam !== 'null') {
        setSelectedAnalysisId(analysisParam)
      }
    }
  }, [searchParams])

  // Load dashboard data when user is available
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])
  
  // Fetch analysis details when selected
  useEffect(() => {
    if (selectedAnalysisId && user && selectedAnalysisId !== 'undefined' && selectedAnalysisId !== 'null') {
      fetchAnalysisDetails(selectedAnalysisId)
    }
  }, [selectedAnalysisId, user])

  const fetchDashboardData = async () => {
    if (!user) return
    
    setLoadingStats(true)
    setLoadError(null)
    
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/dashboard/stats?userId=${encodeURIComponent(user.email)}`)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        console.error('Failed to fetch dashboard stats:', await statsResponse.text())
      }
      
      // Fetch recent analyses
      const analysesResponse = await fetch(`/api/dashboard/analyses?userId=${encodeURIComponent(user.email)}`)
      
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json()
        setRecentAnalyses(analysesData.analyses || [])
      } else {
        console.error('Failed to fetch analyses:', await analysesResponse.text())
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoadError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoadingStats(false)
    }
  }
  
  const fetchAnalysisDetails = async (analysisId: string) => {
    if (!user || !analysisId || analysisId === 'undefined' || analysisId === 'null') return
    
    setLoadingAnalysisDetails(true)
    setAnalysisError(null)
    
    try {
      console.log(`Fetching details for analysis: ${analysisId}`)
      const response = await fetch(`/api/analyses/${encodeURIComponent(analysisId)}?userId=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Validate the response data has required fields
        if (!data.summary) {
          data.summary = {}
        }
        
        setAnalysisDetails(data)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch analysis details:', errorText)
        setAnalysisError(`Couldn't load analysis details: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching analysis details:', error)
      setAnalysisError('Failed to load analysis details. Please try again.')
    } finally {
      setLoadingAnalysisDetails(false)
    }
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
  
  const downloadAnalysisReport = (analysisId: string) => {
    if (!analysisDetails) return
    
    try {
      let csvContent = "SKU,Current_Price,Recommended_Price,Change_%,Weekly_Sales,Inventory_Level,Revenue_Impact,Reason\n"
      
      if (analysisDetails.recommendations && Array.isArray(analysisDetails.recommendations)) {
        analysisDetails.recommendations.forEach(rec => {
          // Safely access properties with null checks and default values
          const sku = rec.sku || 'Unknown'
          const currentPrice = parseFloat(rec.currentPrice) || 0
          const recommendedPrice = parseFloat(rec.recommendedPrice) || 0
          const changePercentage = parseFloat(rec.changePercentage) || 0
          const weeklySales = parseFloat(rec.weeklySales) || 0
          const inventoryLevel = parseInt(rec.inventoryLevel) || 0
          const revenueImpact = parseFloat(rec.revenueImpact) || 0
          const reason = (rec.reason || 'No reason provided').replace(/"/g, '""') // Escape quotes
          
          csvContent += `${sku},${currentPrice.toFixed(2)},${recommendedPrice.toFixed(2)},${changePercentage.toFixed(1)},${weeklySales},${inventoryLevel},${revenueImpact.toFixed(2)},"${reason}"\n`
        })
      }
      
      if (analysisDetails.competitorData && Array.isArray(analysisDetails.competitorData) && analysisDetails.competitorData.length > 0) {
        csvContent += "\n\nCompetitive Intelligence\n"
        csvContent += "SKU,Our_Price,Competitor,Competitor_Price,Price_Difference_%,Product_Name\n"
        
        analysisDetails.competitorData.forEach(comp => {
          // Safely access properties with null checks and default values
          const sku = comp.sku || 'Unknown'
          const ourPrice = parseFloat(comp.our_price) || 0
          const competitor = comp.competitor || 'Unknown'
          const competitorPrice = parseFloat(comp.competitor_price) || 0
          const priceDiffPercentage = parseFloat(comp.price_difference_percentage) || 0
          const productName = (comp.product_name || '').replace(/"/g, '""') // Escape quotes
          
          csvContent += `${sku},${ourPrice.toFixed(2)},${competitor},${competitorPrice.toFixed(2)},${priceDiffPercentage.toFixed(1)},"${productName}"\n`
        })
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analysis-${analysisId}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    }
  }
  
  const clearSelectedAnalysis = () => {
    setSelectedAnalysisId(null)
    setAnalysisDetails(null)
    setAnalysisError(null)
    // Update URL to remove analysis parameter
    router.push('/dashboard')
  }

  // Loading state
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

  // Not logged in state
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
            <p className="text-gray-600">Please sign in to access the Dashboard.</p>
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

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name || user.email}</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/analytics')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Upload className="h-5 w-5" />
              <span>New Analysis</span>
            </button>
            
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center space-x-2 px-4 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:border-gray-400 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {loadError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Error</h3>
            </div>
            <p className="text-red-700 mt-2">{loadError}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Tabs - Only shown when not viewing analysis details */}
        {!selectedAnalysisId && (
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'analyses', label: 'Analyses', icon: FileText },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
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
        )}

        {/* Analysis Details Section */}
        {selectedAnalysisId && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <button
                onClick={clearSelectedAnalysis}
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
                <span>Back to Dashboard</span>
              </button>
              
              {analysisDetails && (
                <button
                  onClick={() => downloadAnalysisReport(selectedAnalysisId)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              )}
            </div>
            
            {/* Loading state */}
            {loadingAnalysisDetails && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analysis details...</p>
              </div>
            )}
            
            {/* Error state */}
            {analysisError && !loadingAnalysisDetails && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-medium text-red-900">Error Loading Analysis</h3>
                </div>
                <p className="text-red-700 mb-4">{analysisError}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => fetchAnalysisDetails(selectedAnalysisId)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={clearSelectedAnalysis}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
            
            {/* Success state - Analysis details */}
            {analysisDetails && !loadingAnalysisDetails && !analysisError && (
              <div className="space-y-8">
                {/* Analysis Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Overview</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{analysisDetails.summary?.totalSKUs || 0}</div>
                      <div className="text-xs text-gray-600">SKUs Analyzed</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <div className="text-2xl font-bold text-green-600">{analysisDetails.summary?.priceIncreases || 0}</div>
                      <div className="text-xs text-gray-600">Price Increases</div>
                    </div>
                    
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                      <div className="text-2xl font-bold text-red-600">{analysisDetails.summary?.priceDecreases || 0}</div>
                      <div className="text-xs text-gray-600">Price Decreases</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600">
                        £{Math.round(analysisDetails.summary?.totalRevenuePotential || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Revenue Potential</div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                      <div className="text-2xl font-bold text-amber-600">
                        {Array.isArray(analysisDetails.competitorData) ? analysisDetails.competitorData.length : 0}
                      </div>
                      <div className="text-xs text-gray-600">Competitor Prices</div>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                      <div className="text-2xl font-bold text-indigo-600">
                        {Array.isArray(analysisDetails.marketInsights) ? analysisDetails.marketInsights.length : 0}
                      </div>
                      <div className="text-xs text-gray-600">Market Insights</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Analysis performed on {new Date(analysisDetails.processedAt || Date.now()).toLocaleString()}
                  </p>
                </div>
                
                {/* Analysis Detail Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'recommendations', label: 'Price Recommendations', icon: TrendingUp },
                      { id: 'competitive', label: 'Competitive Intelligence', icon: Target },
                      { id: 'insights', label: 'Market Insights', icon: Lightbulb }
                    ].map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeDetailTab === tab.id
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailTab(tab.id as any)}
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
                
              {activeDetailTab === 'recommendations' && (
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
        {Array.isArray(analysisDetails.recommendations) && analysisDetails.recommendations.length > 0 ? (
          // Sort recommendations by revenue impact (highest first)
          [...analysisDetails.recommendations]
            .sort((a, b) => (b.revenueImpact || 0) - (a.revenueImpact || 0))
            .slice(0, 10)
            .map((rec, index) => {
              // Guaranteed safe values with fallbacks
              const sku = rec.sku || 'Unknown SKU';
              const currentPrice = typeof rec.currentPrice === 'number' ? rec.currentPrice : 
                                  parseFloat(rec.currentPrice || '0');
              const recommendedPrice = typeof rec.recommendedPrice === 'number' ? rec.recommendedPrice : 
                                      parseFloat(rec.recommendedPrice || '0');
              const changePercentage = typeof rec.changePercentage === 'number' ? rec.changePercentage :
                                      ((recommendedPrice - currentPrice) / (currentPrice || 1)) * 100;
              const revenueImpact = typeof rec.revenueImpact === 'number' ? rec.revenueImpact : 0;
              
              // Determine color based on price change
              const isIncrease = changePercentage > 0;
              const bgColor = isIncrease ? 'bg-green-50' : 'bg-red-50';
              const borderColor = isIncrease ? 'border-green-200' : 'border-red-200';
              const textColor = isIncrease ? 'text-green-600' : 'text-red-600';
              
              return (
                <div key={index} className={`p-4 rounded-xl border ${bgColor} ${borderColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">{sku}</span>
                    <span className={`font-semibold ${textColor}`}>
                      {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">£{currentPrice.toFixed(2)} → £{recommendedPrice.toFixed(2)}</p>
                    <p className="mt-1">{rec.reason || 'Price adjustment recommended'}</p>
                    
                    {revenueImpact !== 0 && (
                      <p className="mt-2 text-xs font-semibold text-green-600">
                        £{Math.abs(Math.round(revenueImpact)).toLocaleString()} potential impact
                      </p>
                    )}
                    
                    {rec.confidence && (
                      <div className="mt-1 text-xs flex items-center text-gray-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {Math.round(rec.confidence * 100)}% confidence
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No price recommendations available</p>
            <p className="text-sm">Upload inventory data with prices to generate recommendations</p>
          </div>
        )}
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
                        {Array.isArray(analysisDetails.criticalAlerts) && analysisDetails.criticalAlerts.length > 0 ? (
                          analysisDetails.criticalAlerts.slice(0, 8).map((alert, index) => (
                            <div 
                              key={index} 
                              className={`p-4 rounded-xl border ${
                                alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-gray-900">{alert.product_sku || alert.sku_code || 'Unknown'}</span>
                                <span className={`font-semibold uppercase text-xs px-2 py-1 rounded ${
                                  alert.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                }`}>
                                  {alert.severity || 'High'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>{alert.message || 'No details available'}</p>
                                {alert.estimated_impact && (
                                  <p className="text-xs mt-1 text-red-600">
                                    £{Math.round(parseFloat(alert.estimated_impact)).toLocaleString()} at risk
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No critical alerts</p>
                            <p className="text-sm">All products have healthy stock levels</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'competitive' && (
                  <div className="space-y-6">
                    {/* Competitive Data Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Competitive Price Analysis</h3>
                        <p className="text-sm text-gray-600">Real-time pricing intelligence from UK alcohol retailers</p>
                      </div>
                      
                      {Array.isArray(analysisDetails.competitorData) && analysisDetails.competitorData.length > 0 ? (
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
                              {analysisDetails.competitorData.slice(0, 15).map((comp, index) => {
                                // Safe property access with default values
                                const ourPrice = parseFloat(comp.our_price) || 0
                                const competitorPrice = parseFloat(comp.competitor_price) || 0
                                const priceDiffPercentage = parseFloat(comp.price_difference_percentage) || 0
                                const priceDifference = parseFloat(comp.price_difference) || 0
                                
                                return (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="font-medium text-gray-900">{comp.sku || 'Unknown'}</div>
                                      {comp.product_name && (
                                        <div className="text-sm text-gray-500">{comp.product_name}</div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-lg font-semibold text-gray-900">£{ourPrice.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{comp.competitor || 'Unknown'}</div>
                                      {comp.availability !== undefined && (
                                        <div className={`text-xs ${comp.availability ? 'text-green-600' : 'text-red-600'}`}>
                                          {comp.availability ? 'Available' : 'Out of stock'}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-lg font-semibold text-gray-900">£{competitorPrice.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        priceDiffPercentage > 10 ? 'bg-red-100 text-red-800' :
                                        priceDiffPercentage < -10 ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {priceDiffPercentage > 0 ? '+' : ''}{priceDiffPercentage.toFixed(1)}%
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        £{priceDifference.toFixed(2)}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No competitor data available</p>
                          <p className="text-sm">Try adding more recognized brands to your inventory</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'insights' && (
                  <div className="space-y-6">
                    {Array.isArray(analysisDetails.marketInsights) && analysisDetails.marketInsights.length > 0 ? (
                      analysisDetails.marketInsights.map((insight, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <Lightbulb className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{insight.title || 'Market Insight'}</h3>
                              <div className="text-sm text-gray-500">Market Intelligence</div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{insight.description || 'No description available'}</p>
                          
                          {Array.isArray(insight.actionable_steps) && insight.actionable_steps.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <h4 className="font-medium text-gray-900">Recommended Actions:</h4>
                              <ul className="space-y-1">
                                {insight.actionable_steps.map((step: string, stepIdx: number) => (
                                  <li key={stepIdx} className="flex items-start space-x-2">
                                    <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-600">No market insights available</p>
                        <p className="text-sm text-gray-500">Insights are generated based on your inventory data and market trends</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Analysis not found state */}
            {!loadingAnalysisDetails && !analysisDetails && !analysisError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                  <h3 className="text-lg font-medium text-amber-800">Analysis Not Found</h3>
                </div>
                <p className="text-amber-700 mb-4">
                  The analysis you're looking for couldn't be found. It may have been deleted or you might not have permission to view it.
                </p>
                <button
                  onClick={clearSelectedAnalysis}
                  className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* Regular Dashboard Content */}
        {!selectedAnalysisId && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                {loadingStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
                    ))}
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total SKUs</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.totalSKUs || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                          <Package className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        Across {stats.totalAnalyses || 0} analyses
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Revenue Potential</p>
                          <p className="text-3xl font-bold text-gray-900">£{Math.round(stats.totalRevenuePotential || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        From price optimizations
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Recent Activity</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.recentAnalyses || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        Analyses in the last 30 days
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <p className="text-amber-800">Failed to load dashboard statistics</p>
                    </div>
                    <button 
                      onClick={fetchDashboardData}
                      className="mt-3 text-amber-600 hover:text-amber-800 text-sm underline"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Recent Analyses */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Analyses</h2>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Upload className="h-4 w-4" />
                      <span>New Analysis</span>
                    </button>
                  </div>
                  
                  {Array.isArray(recentAnalyses) && recentAnalyses.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKUs</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {recentAnalyses.map((analysis, index) => (
  <tr key={analysis._id || `analysis-${index}`} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{analysis.fileName || 'Unnamed analysis'}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {analysis.processedAt ? new Date(analysis.processedAt).toLocaleDateString() : 'Unknown date'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {analysis.processedAt ? new Date(analysis.processedAt).toLocaleTimeString() : ''}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{analysis.summary?.totalSKUs || 0}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedAnalysisId(analysis.uploadId)}
                                  className="inline-flex items-center space-x-1 text-sm font-medium text-amber-600 hover:text-amber-800"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No analyses found</p>
                      <p className="text-sm text-gray-500 mb-4">Upload your first inventory file to get started</p>
                      <button
                        onClick={() => router.push('/analytics')}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-purple-700 transition-all duration-200"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Inventory File</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analyses' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">All Analyses</h2>
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </button>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      <span>New Analysis</span>
                    </button>
                  </div>
                </div>
                
                {Array.isArray(recentAnalyses) && recentAnalyses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKUs</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendations</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Impact</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentAnalyses.map((analysis, index) => (
  <tr key={analysis._id || `analysis-${index}`} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{analysis.fileName || 'Unnamed analysis'}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {analysis.processedAt ? new Date(analysis.processedAt).toLocaleDateString() : 'Unknown date'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {analysis.processedAt ? new Date(analysis.processedAt).toLocaleTimeString() : ''}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{analysis.summary?.totalSKUs || 0}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {((analysis.summary?.priceIncreases || 0) + (analysis.summary?.priceDecreases || 0))}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600">
                                £{Math.round(analysis.summary?.totalRevenuePotential || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedAnalysisId(analysis.uploadId)}
                                className="inline-flex items-center space-x-1 text-sm font-medium text-amber-600 hover:text-amber-800"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No analyses found</p>
                    <p className="text-sm text-gray-500 mb-4">Upload your first inventory file to get started</p>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-purple-700 transition-all duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Inventory File</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Inventory Alerts</h2>
                  <button className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
                
                {/* This would show alerts from all analyses */}
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No active alerts</p>
                  <p className="text-sm text-gray-500">All your inventory levels are currently healthy</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}