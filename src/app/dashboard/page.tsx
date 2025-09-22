// src/app/dashboard/page.tsx - COMPLETE FIXED VERSION
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  BarChart3, TrendingUp, AlertTriangle, Download, Upload, Calendar, DollarSign, Package, Clock, CheckCircle, Filter, Eye, RefreshCw, Target, Brain, Lightbulb, FileText, ArrowRight, Zap, Tag, Crown, Gift, Wine, Info, X, ChevronDown, ChevronUp
} from 'lucide-react'

// Fixed type definitions
interface DashboardStats {
  totalAnalyses: number
  totalSKUs: number
  totalRevenuePotential: number
  avgSKUsPerAnalysis: number
  recentAnalyses: number
}

interface SeasonalStrategy {
  id?: string
  type: string
  title: string
  description: string
  reasoning: string
  seasonal_trigger: string
  estimated_revenue_impact: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  implementation_timeline: string
  marketing_angle?: string
  target_customer?: string
  products_involved: string[]
  execution_steps: string[]
  success_metrics?: string[]
  risk_factors?: string[]
  pricing_strategy?: any
  status?: string
  created_at?: string
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
  seasonalStrategies?: SeasonalStrategy[]
  seasonal_strategies?: SeasonalStrategy[]
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
    seasonalStrategiesGenerated?: number
    seasonalRevenuePotential?: number
  }
  recommendations: any[]
  competitorData: any[]
  marketInsights: any[]
  seasonalStrategies?: SeasonalStrategy[]
  seasonal_strategies?: SeasonalStrategy[]
  criticalAlerts: any[]
  processedAt: string
}

// FIXED: Robust seasonal strategy extraction
function getSeasonalStrategies(data: any): SeasonalStrategy[] {
  if (!data) return []
  
  console.log('🔍 Extracting seasonal strategies from:', Object.keys(data))
  
  // Try all possible locations
  let strategies: any[] = []
  
  const possibleSources = [
    data.seasonalStrategies,
    data.seasonal_strategies,
    data.SeasonalStrategies,
    data.analysis?.seasonalStrategies,
    data.analysis?.seasonal_strategies,
    data.summary?.seasonalStrategies,
    data.metadata?.seasonalStrategies
  ]
  
  for (const source of possibleSources) {
    if (Array.isArray(source) && source.length > 0) {
      strategies = source
      break
    }
  }
  
  if (strategies.length === 0) {
    console.log('⚠️ No seasonal strategies found in any location')
    return []
  }
  
  console.log(`✅ Found ${strategies.length} raw seasonal strategies`)
  
  // Transform and validate strategies
  const validStrategies = strategies
    .filter((s: any) => s && typeof s === 'object' && s.title)
    .map((s: any, index: number) => ({
      id: s.id || s._id || `strategy-${Date.now()}-${index}`,
      type: s.type || 'seasonal_promotion',
      title: s.title || `Strategy ${index + 1}`,
      description: s.description || '',
      reasoning: s.reasoning || '',
      seasonal_trigger: s.seasonal_trigger || s.seasonalTrigger || '',
      estimated_revenue_impact: parseFloat(s.estimated_revenue_impact || s.estimatedRevenueImpact || 0),
      urgency: s.urgency || 'medium',
      implementation_timeline: s.implementation_timeline || s.implementationTimeline || '',
      marketing_angle: s.marketing_angle || s.marketingAngle || '',
      target_customer: s.target_customer || s.targetCustomer || '',
      products_involved: safeParseArray(s.products_involved || s.productsInvolved),
      execution_steps: safeParseArray(s.execution_steps || s.executionSteps),
      success_metrics: safeParseArray(s.success_metrics || s.successMetrics),
      risk_factors: safeParseArray(s.risk_factors || s.riskFactors),
      pricing_strategy: s.pricing_strategy || s.pricingStrategy || {},
      status: s.status || 'pending',
      created_at: s.created_at || s.createdAt || new Date().toISOString()
    }))
  
  console.log(`🎯 Processed ${validStrategies.length} valid seasonal strategies`)
  return validStrategies
}

// Helper to safely parse arrays from JSON or arrays
function safeParseArray(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
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
  const [debugMode, setDebugMode] = useState(false)
  
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
  const [activeDetailTab, setActiveDetailTab] = useState<'recommendations' | 'competitive' | 'seasonal' | 'insights'>('recommendations')
  
  // Seasonal strategy expansion state
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set())

  // Safely extract seasonal strategies with memoization
  const seasonalStrategies = useMemo(() => {
    const strategies = getSeasonalStrategies(analysisDetails)
    console.log(`📊 Dashboard: Memoized ${strategies.length} seasonal strategies`)
    return strategies
  }, [analysisDetails])

  // Check for analysis parameter in URL
  useEffect(() => {
    if (searchParams) {
      const analysisParam = searchParams.get('analysis')
      if (analysisParam && analysisParam !== 'undefined' && analysisParam !== 'null') {
        console.log(`🔗 Loading analysis from URL: ${analysisParam}`)
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
      console.log(`📊 Fetching dashboard data for ${user.email}`)
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/dashboard/stats?userId=${encodeURIComponent(user.email)}`)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
        console.log('✅ Stats loaded:', statsData)
      } else {
        console.error('Failed to fetch dashboard stats:', await statsResponse.text())
      }
      
      // Fetch recent analyses with seasonal data
      const analysesResponse = await fetch(`/api/dashboard/analyses?userId=${encodeURIComponent(user.email)}`)
      
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json()
        console.log('📊 Fetched analyses:', analysesData)
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
      console.log(`🔍 Fetching details for analysis: ${analysisId}`)
      const response = await fetch(`/api/analyses/${encodeURIComponent(analysisId)}?userId=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Analysis details received:', data)
        
        // Validate the response data
        if (!data.summary) {
          data.summary = {}
        }
        
        // Extract seasonal strategies and log for debugging
        const strategies = getSeasonalStrategies(data)
        console.log(`🎄 Analysis ${analysisId} has ${strategies.length} seasonal strategies:`, strategies)
        
        setAnalysisDetails(data)
        
        // Automatically switch to seasonal tab if strategies exist
        if (strategies.length > 0 && activeDetailTab === 'recommendations') {
          setActiveDetailTab('seasonal')
        }
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

  const toggleStrategyExpansion = (strategyId: string) => {
    setExpandedStrategies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(strategyId)) {
        newSet.delete(strategyId)
      } else {
        newSet.add(strategyId)
      }
      return newSet
    })
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
  
  const clearSelectedAnalysis = () => {
    setSelectedAnalysisId(null)
    setAnalysisDetails(null)
    setAnalysisError(null)
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
            
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="inline-flex items-center space-x-2 px-3 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
              title="Toggle debug mode"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <div className="mb-8 bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400">Debug Mode</span>
              <button onClick={() => setDebugMode(false)}>
                <X className="h-4 w-4 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div>User: {user?.email}</div>
            <div>Selected Analysis: {selectedAnalysisId || 'none'}</div>
            <div>Seasonal Strategies Count: {seasonalStrategies.length}</div>
            <div>Analysis Details: {analysisDetails ? 'Loaded' : 'Not loaded'}</div>
            <div>ANTHROPIC_API_KEY: {process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing'}</div>
            {analysisDetails && (
              <details className="mt-2">
                <summary className="cursor-pointer text-yellow-400">Analysis Data Structure</summary>
                <pre className="mt-2 text-xs max-h-96 overflow-y-auto">
                  {JSON.stringify(analysisDetails, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

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
                <button
                  onClick={clearSelectedAnalysis}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Return to Dashboard
                </button>
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
                      <div className="text-xs text-gray-600">SKUs</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <div className="text-2xl font-bold text-green-600">{analysisDetails.summary?.priceIncreases || 0}</div>
                      <div className="text-xs text-gray-600">Increases</div>
                    </div>
                    
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                      <div className="text-2xl font-bold text-red-600">{analysisDetails.summary?.priceDecreases || 0}</div>
                      <div className="text-xs text-gray-600">Decreases</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600">
                        £{Math.round(analysisDetails.summary?.totalRevenuePotential || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                      <div className="text-2xl font-bold text-amber-600">
                        {Array.isArray(analysisDetails.competitorData) ? analysisDetails.competitorData.length : 0}
                      </div>
                      <div className="text-xs text-gray-600">Competitor</div>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
                      <div className="text-2xl font-bold text-indigo-600">
                        {seasonalStrategies.length}
                      </div>
                      <div className="text-xs text-gray-600">Seasonal</div>
                    </div>
                  </div>
                </div>
                
                {/* Analysis Detail Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'recommendations', label: 'Price Recommendations', icon: TrendingUp },
                      { id: 'competitive', label: 'Competitive Intelligence', icon: Target },
                      { 
                        id: 'seasonal', 
                        label: `Seasonal Strategies ${seasonalStrategies.length > 0 ? `(${seasonalStrategies.length})` : ''}`, 
                        icon: Calendar 
                      },
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

                {/* Tab Content - Seasonal Strategies (FIXED VERSION) */}
                {activeDetailTab === 'seasonal' && (
                  <div className="space-y-6">
                    {seasonalStrategies.length > 0 ? (
                      <div className="space-y-6">
                        {/* Seasonal Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <div className="text-2xl font-bold text-green-600">
                              {seasonalStrategies.length}
                            </div>
                            <div className="text-sm text-green-700">Seasonal Strategies</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                              £{Math.round(seasonalStrategies.reduce((sum, s) => sum + (s.estimated_revenue_impact || 0), 0)).toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-700">Revenue Potential</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                            <div className="text-2xl font-bold text-orange-600">
                              {seasonalStrategies.filter(s => s.urgency === 'high' || s.urgency === 'critical').length}
                            </div>
                            <div className="text-sm text-orange-700">Urgent Actions</div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                            <div className="text-2xl font-bold text-purple-600">
                              £{seasonalStrategies.length > 0 ? Math.max(...seasonalStrategies.map(s => s.estimated_revenue_impact || 0)).toLocaleString() : '0'}
                            </div>
                            <div className="text-sm text-purple-700">Top Opportunity</div>
                          </div>
                        </div>

                        {/* Seasonal Strategies Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {seasonalStrategies.map((strategy, index) => {
                            const urgencyColors = {
                              critical: 'from-red-500 to-pink-500',
                              high: 'from-orange-500 to-red-400', 
                              medium: 'from-yellow-500 to-orange-400',
                              low: 'from-blue-500 to-cyan-400'
                            }
                            
                            const typeIcons = {
                              mystery_box: Package,
                              bundle: Package,
                              seasonal_promotion: Calendar,
                              clearance: Tag,
                              premium_positioning: Crown,
                              gift_packaging: Gift,
                              tasting_experience: Wine
                            }
                            
                            const Icon = typeIcons[strategy.type as keyof typeof typeIcons] || Package
                            const urgencyGradient = urgencyColors[strategy.urgency as keyof typeof urgencyColors] || 'from-gray-500 to-gray-400'
                            const isExpanded = expandedStrategies.has(strategy.id || `strategy-${index}`)
                            
                            return (
                              <div 
                                key={strategy.id || `strategy-${index}`}
                                className="bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-gray-200"
                              >
                                {/* Strategy Header */}
                                <div className={`bg-gradient-to-r ${urgencyGradient} p-4`}>
                                  <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-lg">{strategy.title}</h3>
                                        <p className="text-sm opacity-90">{strategy.type.replace(/_/g, ' ').toUpperCase()}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold">£{Math.round(strategy.estimated_revenue_impact).toLocaleString()}</div>
                                      <div className="text-xs opacity-90">POTENTIAL</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Strategy Content */}
                                <div className="p-6 space-y-4">
                                  {/* Description */}
                                  <p className="text-gray-700 leading-relaxed">{strategy.description}</p>
                                  
                                  {/* Urgency & Timeline */}
                                  <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                      strategy.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                                      strategy.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                      strategy.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {strategy.urgency} Urgency
                                    </span>
                                    {strategy.implementation_timeline && (
                                      <span className="text-sm text-gray-600">
                                        Timeline: {strategy.implementation_timeline}
                                      </span>
                                    )}
                                  </div>

                                  {/* Expandable Content */}
                                  <div className="border-t border-gray-200 pt-4">
                                    <button
                                      onClick={() => toggleStrategyExpansion(strategy.id || `strategy-${index}`)}
                                      className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-amber-600 transition-colors"
                                    >
                                      <span>See Details</span>
                                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </button>
                                    
                                    {isExpanded && (
                                      <div className="mt-4 space-y-4">
                                        {/* Seasonal Context */}
                                        {strategy.reasoning && (
                                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-2">
                                              <Calendar className="h-4 w-4 text-amber-600" />
                                              <span className="font-medium text-amber-800">Seasonal Context</span>
                                            </div>
                                            <p className="text-amber-700 text-sm">{strategy.reasoning}</p>
                                            {strategy.seasonal_trigger && (
                                              <p className="text-amber-600 text-xs mt-1 font-medium">
                                                Trigger: {strategy.seasonal_trigger}
                                              </p>
                                            )}
                                          </div>
                                        )}

                                        {/* Products Involved */}
                                        {strategy.products_involved.length > 0 && (
                                          <div className="bg-gray-50 rounded-lg p-3">
                                            <h4 className="font-medium text-gray-900 mb-2">Products Involved:</h4>
                                            <div className="flex flex-wrap gap-2">
                                              {strategy.products_involved.slice(0, 4).map((sku, skuIndex) => (
                                                <span key={skuIndex} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-700">
                                                  {String(sku)}
                                                </span>
                                              ))}
                                              {strategy.products_involved.length > 4 && (
                                                <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
                                                  +{strategy.products_involved.length - 4} more
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Action Steps */}
                                        {strategy.execution_steps.length > 0 && (
                                          <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Execution Steps:</h4>
                                            <div className="space-y-2">
                                              {strategy.execution_steps.map((step, stepIndex) => (
                                                <div key={stepIndex} className="flex items-start space-x-2">
                                                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                                                    {stepIndex + 1}
                                                  </span>
                                                  <span className="text-sm text-gray-700">{String(step)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Success Metrics */}
                                        {strategy.success_metrics && strategy.success_metrics.length > 0 && (
                                          <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Success Metrics:</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                              {strategy.success_metrics.map((metric, metricIndex) => (
                                                <li key={metricIndex} className="flex items-center space-x-2">
                                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                  <span>{String(metric)}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Seasonal Strategies Generated</h3>
                        <p className="text-gray-600 mb-4">
                          Seasonal recommendations require inventory data and current seasonal opportunities.
                        </p>
                        <div className="text-sm text-gray-500 space-y-2">
                          <p>Strategies are created when:</p>
                          <ul className="text-left inline-block">
                            <li>• You have slow-moving inventory</li>
                            <li>• Upcoming holidays or seasonal events</li>
                            <li>• Premium products suitable for gifting</li>
                            <li>• Current market opportunities</li>
                          </ul>
                        </div>
                        
                        {debugMode && (
                          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                            <p className="text-xs font-mono text-gray-600">
                              Debug: Analysis ID: {selectedAnalysisId}
                            </p>
                            <p className="text-xs font-mono text-gray-600">
                              Checked: seasonalStrategies, seasonal_strategies, SeasonalStrategies
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content - Recommendations */}
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
                          [...analysisDetails.recommendations]
                            .sort((a, b) => (b.revenueImpact || 0) - (a.revenueImpact || 0))
                            .slice(0, 10)
                            .map((rec, index) => {
                              const sku = rec.sku || 'Unknown SKU'
                              const currentPrice = typeof rec.currentPrice === 'number' ? rec.currentPrice : 
                                                  parseFloat(rec.currentPrice || '0')
                              const recommendedPrice = typeof rec.recommendedPrice === 'number' ? rec.recommendedPrice : 
                                                      parseFloat(rec.recommendedPrice || '0')
                              const changePercentage = typeof rec.changePercentage === 'number' ? rec.changePercentage :
                                                      ((recommendedPrice - currentPrice) / (currentPrice || 1)) * 100
                              const revenueImpact = typeof rec.revenueImpact === 'number' ? rec.revenueImpact : 0
                              
                              const isIncrease = changePercentage > 0
                              const bgColor = isIncrease ? 'bg-green-50' : 'bg-red-50'
                              const borderColor = isIncrease ? 'border-green-200' : 'border-red-200'
                              const textColor = isIncrease ? 'text-green-600' : 'text-red-600'
                              
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
                              )
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
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto">
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

                {/* Tab Content - Competitive */}
                {activeDetailTab === 'competitive' && (
                  <div className="space-y-6">
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

                {/* Tab Content - Insights */}
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
          </div>
        )}

        {/* Regular Dashboard Content (when no analysis selected) */}
        {!selectedAnalysisId && (
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
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Recent Analyses</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.recentAnalyses || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recent Analyses Table */}
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKUs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seasonal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentAnalyses.map((analysis, index) => {
                        const analysisSeasonal = getSeasonalStrategies(analysis)
                        return (
                          <tr key={analysis._id || `analysis-${index}`} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{analysis.fileName || 'Unnamed analysis'}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {analysis.processedAt ? new Date(analysis.processedAt).toLocaleDateString() : 'Unknown'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{analysis.summary?.totalSKUs || 0}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {analysisSeasonal.length > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {analysisSeasonal.length}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
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
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No analyses found</p>
                  <button
                    onClick={() => router.push('/analytics')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-purple-700 transition-all duration-200 mt-4"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Inventory File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}