// src/app/dashboard/page.tsx - COMPLETE ENHANCED DASHBOARD
'use client'

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  BarChart3, TrendingUp, AlertTriangle, Download, Upload, Calendar, DollarSign, Package, Clock, CheckCircle, Filter, Eye, RefreshCw, Target, Brain, Lightbulb, FileText, ArrowRight, Zap, Tag, Crown, Gift, Wine, Info, X, ChevronDown, ChevronUp, Activity, Play, Pause, ExternalLink, Shield, Loader2
} from 'lucide-react'

// Lazy load visual components for better performance
const VisualPortfolioHealth = dynamic(
  () => import('@/components/ui/visual-portfolio-health').then(mod => ({ default: mod.VisualPortfolioHealth })),
  {
    loading: () => (
      <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-3" />
        <p className="text-white/60">Loading visual analytics...</p>
      </div>
    ),
    ssr: false
  }
)

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

interface ClaudeInsight {
  id: string
  type: 'strategic_alert' | 'market_opportunity' | 'competitive_threat' | 'pricing_strategy'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  claude_analysis: string
  strategic_recommendations: string[]
  immediate_actions: string[]
  revenue_impact_estimate: number
  confidence_score: number
  affected_products: string[]
  competitors_involved: string[]
  market_context: string
  urgency_timeline: string
  timestamp: Date
}

interface CompetitiveFeedData {
  claude_insights: ClaudeInsight[]
  monitoring_strategy: any
  portfolio_assessment: any
  data_context: any
}

interface MonitoringStatus {
  isActive: boolean
  activeProducts: number
  totalRetailers: number
  lastCheck: string
  config?: any
}

function getSeasonalStrategies(data: any): SeasonalStrategy[] {
  if (!data) return []
  
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
  
  if (strategies.length === 0) return []
  
  return strategies
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
}

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

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, login, isLoading } = useUser()
  
  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'live-intelligence' | 'analysis'>('live-intelligence')
  
  // Live Competitive Intelligence State
  const [feedData, setFeedData] = useState<CompetitiveFeedData | null>(null)
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null)
  const [competitiveLoading, setCompetitiveLoading] = useState(false)
  const [competitiveError, setCompetitiveError] = useState<string | null>(null)
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(0)

  
  // Auth state
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  
  // Analysis details state
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null)
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null)
  const [loadingAnalysisDetails, setLoadingAnalysisDetails] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState<'recommendations' | 'competitive' | 'seasonal' | 'insights'>('recommendations')
  
  // Seasonal strategy expansion state
  const [expandedStrategies, setExpandedStrategies] = useState<Set<string>>(new Set())

  // Memoized seasonal strategies
  const seasonalStrategies = useMemo(() => {
    return getSeasonalStrategies(analysisDetails)
  }, [analysisDetails])

// Improved auto-refresh with tab visibility detection
useEffect(() => {
  const startAutoRefresh = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (autoRefresh && activeTab === 'live-intelligence' && user) {
      console.log('Starting auto-refresh interval')
      
      intervalRef.current = setInterval(() => {
        // Only refresh if tab is visible and enough time has passed
        if (!document.hidden) {
          const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
          if (timeSinceLastRefresh >= 4 * 60 * 1000) { // 4 minutes minimum
            console.log('Auto-refresh triggered')
            lastRefreshRef.current = Date.now()
            fetchCompetitiveIntelligence(true)
          }
        }
      }, 5 * 60 * 1000)
    }
  }

  // Handle tab visibility changes
  const handleVisibilityChange = () => {
    if (!document.hidden && activeTab === 'live-intelligence') {
      // Tab became visible - refresh if it's been a while
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current
      if (timeSinceLastRefresh >= 3 * 60 * 1000) { // 3 minutes
        console.log('Tab visible - refreshing stale data')
        lastRefreshRef.current = Date.now()
        fetchCompetitiveIntelligence(true)
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  startAutoRefresh()

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [autoRefresh, activeTab, user])

  useEffect(() => {
    if (searchParams) {
      const analysisParam = searchParams.get('analysis')
      if (analysisParam && analysisParam !== 'undefined' && analysisParam !== 'null') {
        setSelectedAnalysisId(analysisParam)
        setActiveTab('analysis')
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      if (activeTab === 'live-intelligence') {
        fetchCompetitiveIntelligence()
        fetchMonitoringStatus()
      }
    }
  }, [user, activeTab])
  
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
      const statsResponse = await fetch(`/api/dashboard/stats?userId=${encodeURIComponent(user.email)}`)
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
      
      const analysesResponse = await fetch(`/api/dashboard/analyses?userId=${encodeURIComponent(user.email)}`)
      
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json()
        setRecentAnalyses(analysesData.analyses || [])
      }
    } catch (error) {
      setLoadError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoadingStats(false)
    }
  }

const fetchCompetitiveIntelligence = async (isRefresh = false) => {
  if (!user) return
  
  // Prevent rapid successive calls
  if (isRefresh) {
    const timeSinceLastCall = Date.now() - lastRefreshRef.current
    if (timeSinceLastCall < 90 * 1000) { // 90 seconds minimum between refreshes
      console.log('Refresh throttled - too soon since last call')
      return
    }
    setRefreshing(true)
    lastRefreshRef.current = Date.now()
  } else {
    setCompetitiveLoading(true)
  }
    
    setCompetitiveError(null)

    try {
      const response = await fetch(`/api/dashboard/competitive-feed?userId=${encodeURIComponent(user.email)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setFeedData(data)
      
    } catch (err) {
      console.error('Competitive intelligence fetch failed:', err)
      setCompetitiveError(err instanceof Error ? err.message : 'Failed to load competitive intelligence')
    } finally {
      setCompetitiveLoading(false)
      setRefreshing(false)
    }
  }

  const fetchMonitoringStatus = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/monitoring?userId=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const data = await response.json()
        setMonitoringStatus(data.status)
      }
    } catch (err) {
      console.error('Monitoring status fetch failed:', err)
    }
  }

  const toggleMonitoring = async () => {
    if (!user || !feedData?.data_context) return
    
    try {
      if (monitoringStatus?.isActive) {
        // Stop monitoring using your existing API
        await fetch(`/api/monitoring?userId=${encodeURIComponent(user.email)}`, {
          method: 'DELETE'
        })
      } else {
        // Start monitoring with top products using your existing API
        const topProducts = Array.from({ length: Math.min(10, feedData.data_context.inventory_size) }, (_, i) => ({
          sku: `TOP-PRODUCT-${i + 1}`,
          product: `Top Product ${i + 1}`,
          category: 'spirits',
          currentPrice: 25 + Math.random() * 50
        }))

        await fetch('/api/monitoring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.email,
            products: topProducts,
            intervalMinutes: 240, // 4 hours
            maxRetailersPerCheck: 3
          })
        })
      }

      // Refresh status
      setTimeout(() => fetchMonitoringStatus(), 1000)
    } catch (err) {
      console.error('Toggle monitoring failed:', err)
    }
  }
  
  const fetchAnalysisDetails = async (analysisId: string) => {
    if (!user || !analysisId || analysisId === 'undefined' || analysisId === 'null') return
    
    setLoadingAnalysisDetails(true)
    setAnalysisError(null)
    
    try {
      const response = await fetch(`/api/analyses/${encodeURIComponent(analysisId)}?userId=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (!data.summary) {
          data.summary = {}
        }
        
        const strategies = getSeasonalStrategies(data)
        setAnalysisDetails(data)
        
        if (strategies.length > 0 && activeDetailTab === 'recommendations') {
          setActiveDetailTab('seasonal')
        }
      } else {
        setAnalysisError(`Couldn't load analysis details: ${response.status}`)
      }
    } catch (error) {
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

  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev)
      if (newSet.has(insightId)) {
        newSet.delete(insightId)
      } else {
        newSet.add(insightId)
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
    setActiveTab('overview')
    router.push('/dashboard')
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-400" />
      case 'high': return <TrendingUp className="h-5 w-5 text-orange-400" />
      case 'medium': return <Target className="h-5 w-5 text-yellow-400" />
      default: return <Eye className="h-5 w-5 text-white/60" />
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-400/30 bg-red-500/10'
      case 'high': return 'border-orange-400/30 bg-orange-500/10'
      case 'medium': return 'border-yellow-400/30 bg-yellow-500/10'
      default: return 'border-white/30 bg-white/5'
    }
  }

  // Loading state
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

  // Not logged in state
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
            <p className="text-white/60">Please sign in to access the Dashboard.</p>
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

  // Main dashboard
  return (
    <div className="min-h-screen bg-black">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-light text-white">Dashboard</h1>
            <p className="text-white/60 mt-1">Welcome back, {user.name || user.email}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/analytics')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>New Analysis</span>
            </button>
            
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center space-x-2 px-4 py-3 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="p-3 bg-white/5 text-white/60 rounded hover:bg-white/10 transition-colors"
              title="Toggle debug mode"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <div className="mb-8 bg-white/5 border border-white/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 font-mono text-sm">Debug Mode</span>
              <button onClick={() => setDebugMode(false)}>
                <X className="h-4 w-4 text-white/60 hover:text-white" />
              </button>
            </div>
            <div className="font-mono text-xs space-y-1 text-white/60">
              <div>User: {user?.email}</div>
              <div>Active Tab: {activeTab}</div>
              <div>Selected Analysis: {selectedAnalysisId || 'none'}</div>
              <div>Seasonal Strategies: {seasonalStrategies.length}</div>
              <div>Monitoring Active: {monitoringStatus?.isActive ? 'Yes' : 'No'}</div>
              <div>Claude Insights: {feedData?.claude_insights?.length || 0}</div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {loadError && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="font-medium text-red-300">Error</h3>
            </div>
            <p className="text-red-200 text-sm mb-3">{loadError}</p>
            <button 
              onClick={fetchDashboardData}
              className="text-red-300 hover:text-red-100 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <div className="mb-8 border-b border-white/20">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'live-intelligence', label: 'Live Competitive Intelligence', icon: Brain },
              { id: 'overview', label: 'Analytics Overview', icon: BarChart3 },
              { id: 'analysis', label: selectedAnalysisId ? 'Analysis Details' : 'Recent Analyses', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-white text-white"
                      : "border-transparent text-white/60 hover:text-white/80 hover:border-white/30"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    isActive ? "text-white" : "text-white/40 group-hover:text-white/60"
                  }`} />
                  <span>{tab.label}</span>
                  {tab.id === 'live-intelligence' && feedData?.claude_insights && feedData.claude_insights.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">
                      {feedData.claude_insights.filter(i => i.priority === 'critical' || i.priority === 'high').length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'live-intelligence' && (
          <div className="space-y-6">
            {/* Competitive Intelligence Header with Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white/60" />
                </div>
                <div>
                  <h2 className="text-2xl font-light text-white">Live Competitive Intelligence</h2>
                  <p className="text-white/60 text-sm">Powered by AI Intelligence & Real-time Scraping</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4"> 
                {/* Monitoring Toggle */}
                {monitoringStatus && (
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">Live Monitoring:</span>
                    <button
                      onClick={toggleMonitoring}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        monitoringStatus.isActive
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/15'
                      }`}
                    >
                      {monitoringStatus.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      <span>{monitoringStatus.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>
                )}
                
                {/* Refresh Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`p-2 rounded transition-colors ${
                      autoRefresh 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-white/10 text-white/60 hover:bg-white/15'
                    }`}
                    title={`Auto-refresh: ${autoRefresh ? 'On' : 'Off'}`}
                  >
                    <Activity className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => fetchCompetitiveIntelligence(true)}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Competitive Intelligence Content */}
            {competitiveLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60">Loading Claude AI competitive intelligence...</p>
              </div>
            ) : competitiveError ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <h3 className="text-lg font-medium text-red-300">Competitive Intelligence Error</h3>
                </div>
                <p className="text-red-200 mb-4">{competitiveError}</p>
                <button
                  onClick={() => fetchCompetitiveIntelligence()}
                  className="text-red-300 hover:text-red-100 font-medium"
                >
                  Retry Analysis
                </button>
              </div>
            ) : !feedData ? (
              <div className="text-center py-12 bg-white/5 border border-white/20 rounded-lg">
                <Brain className="h-12 w-12 mx-auto mb-4 text-white/40" />
                <p className="text-white/60 mb-4">No competitive intelligence data available</p>
                <button
                  onClick={() => fetchCompetitiveIntelligence()}
                  className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Generate Intelligence
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Portfolio Assessment */}
                {feedData.portfolio_assessment && (
                  <VisualPortfolioHealth
                    healthScore={feedData.portfolio_assessment.health_score || 7}
                    portfolioAssessment={feedData.portfolio_assessment}
                    dataContext={feedData.data_context}
                  />
                )}

                {/* Claude AI Strategic Insights */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-white/60" />
                      <span>Claude AI Strategic Insights</span>
                    </h3>
                    <span className="text-sm text-white/60">
                      {feedData?.claude_insights?.length || 0} insights • £{Math.round(feedData?.data_context?.total_revenue_at_risk || 0).toLocaleString()} impact
                    </span>
                  </div>

                  {feedData?.claude_insights && feedData.claude_insights.length === 0 ? (
                    <div className="text-center py-8 bg-white/5 border border-white/20 rounded-lg">
                      <Brain className="h-12 w-12 mx-auto mb-3 text-white/30" />
                      <p className="text-white/60">No strategic insights detected</p>
                      <p className="text-sm text-white/50">Upload more inventory or wait for competitive data</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {feedData?.claude_insights && feedData.claude_insights.map((insight) => {
                        const isExpanded = expandedInsights.has(insight.id)
                        const priorityStyle = getPriorityStyle(insight.priority)
                        const priorityIcon = getPriorityIcon(insight.priority)
                        
                        return (
                          <div key={insight.id} className={`border rounded-lg overflow-hidden hover:border-white/40 transition-colors ${priorityStyle}`}>
                            {/* Insight Header */}
                            <div className="p-4 border-b border-white/10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {priorityIcon}
                                  <div>
                                    <h4 className="font-medium text-white">{insight.title}</h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-xs text-white/60 uppercase">{insight.type.replace(/_/g, ' ')}</span>
                                      <span className="text-xs text-white/40">•</span>
                                      <span className="text-xs text-white/60">{insight.urgency_timeline}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-medium text-white">
                                    £{Math.abs(insight.revenue_impact_estimate).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-white/60">
                                    {Math.round(insight.confidence_score * 100)}% confidence
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Insight Content */}
                            <div className="p-4 space-y-3">
                              <p className="text-white/80 text-sm leading-relaxed">
                                {insight.claude_analysis}
                              </p>
                              
                              {/* Affected Products & Competitors */}
                              <div className="flex flex-wrap items-center gap-4 text-xs">
                                {insight.affected_products.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-white/60">Products:</span>
                                    <span className="text-white/80">{insight.affected_products.slice(0, 3).join(', ')}</span>
                                    {insight.affected_products.length > 3 && (
                                      <span className="text-white/60">+{insight.affected_products.length - 3} more</span>
                                    )}
                                  </div>
                                )}
                                
                                {insight.competitors_involved.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-white/60">Competitors:</span>
                                    <span className="text-white/80">{insight.competitors_involved.join(', ')}</span>
                                  </div>
                                )}
                              </div>

                              {/* Expandable Details */}
                              <div className="border-t border-white/10 pt-3">
                                <button
                                  onClick={() => toggleInsightExpansion(insight.id)}
                                  className="flex items-center justify-between w-full text-left font-medium text-white hover:text-white/80 transition-colors"
                                >
                                  <span>Strategic Actions</span>
                                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                                
                                {isExpanded && (
                                  <div className="mt-3 space-y-4">
                                    {/* Strategic Recommendations */}
                                    {insight.strategic_recommendations.length > 0 && (
                                      <div className="bg-white/5 border border-white/20 rounded p-3">
                                        <h5 className="font-medium text-white/80 mb-2 flex items-center space-x-2">
                                          <Crown className="h-4 w-4" />
                                          <span>Strategic Recommendations:</span>
                                        </h5>
                                        <ul className="space-y-1">
                                          {insight.strategic_recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start space-x-2">
                                              <div className="w-1 h-1 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                                              <span className="text-sm text-white/70">{rec}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Immediate Actions */}
                                    {insight.immediate_actions.length > 0 && (
                                      <div>
                                        <h5 className="font-medium text-white/80 mb-2">Immediate Actions:</h5>
                                        <div className="space-y-2">
                                          {insight.immediate_actions.map((action, idx) => (
                                            <div key={idx} className="flex items-start space-x-2">
                                              <span className="w-5 h-5 bg-white/20 text-white/80 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                                                {idx + 1}
                                              </span>
                                              <span className="text-sm text-white/70">{action}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Market Context */}
                                    {insight.market_context && (
                                      <div className="bg-white/5 border border-white/20 rounded p-3">
                                        <h5 className="font-medium text-white/80 mb-2">Market Context:</h5>
                                        <p className="text-sm text-white/70">{insight.market_context}</p>
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
                  )}
                </div>

                {/* Data Context Footer */}
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <div className="text-lg font-medium text-white">{feedData?.data_context?.inventory_size || 0}</div>
                      <div className="text-white/60">Products in Portfolio</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-white">{feedData?.data_context?.competitor_prices_analyzed || 0}</div>
                      <div className="text-white/60">Competitor Prices</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-white">{feedData?.data_context?.unique_competitors || 0}</div>
                      <div className="text-white/60">UK Retailers</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-green-400">
                        {monitoringStatus?.isActive ? 'LIVE' : 'STATIC'}
                      </div>
                      <div className="text-white/60">Data Status</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 text-center">
                    <p className="text-xs text-white/50">
                      Last updated: {new Date().toLocaleTimeString()} • 
                      Powered by Claude AI & SERP API • 
                      Analysis period: {feedData?.data_context?.analysis_period || '7 days'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            {loadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white/5 h-32 rounded-lg"></div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total SKUs</p>
                      <p className="text-3xl font-light text-white">{stats.totalSKUs || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-white/60" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Revenue Potential</p>
                      <p className="text-3xl font-light text-white">£{Math.round(stats.totalRevenuePotential || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Recent Analyses</p>
                      <p className="text-3xl font-light text-white">{stats.recentAnalyses || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Recent Analyses Table */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-white">Recent Analyses</h2>
                <button
                  onClick={() => router.push('/analytics')}
                  className="text-white/60 hover:text-white text-sm font-medium flex items-center space-x-1 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>New Analysis</span>
                </button>
              </div>
              
              {Array.isArray(recentAnalyses) && recentAnalyses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">File Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">SKUs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Seasonal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {recentAnalyses.map((analysis, index) => {
                        const analysisSeasonal = getSeasonalStrategies(analysis)
                        return (
                          <tr key={analysis._id || `analysis-${index}`} className="hover:bg-white/5">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-white">{analysis.fileName || 'Unnamed analysis'}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-white/60">
                                {analysis.processedAt ? new Date(analysis.processedAt).toLocaleDateString() : 'Unknown'}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">{analysis.summary?.totalSKUs || 0}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {analysisSeasonal.length > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {analysisSeasonal.length}
                                </span>
                              ) : (
                                <span className="text-white/40 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedAnalysisId(analysis.uploadId)
                                  setActiveTab('analysis')
                                }}
                                className="inline-flex items-center space-x-1 text-sm font-medium text-white/60 hover:text-white transition-colors"
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
                  <Calendar className="h-12 w-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60">No analyses found</p>
                  <button
                    onClick={() => router.push('/analytics')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors mt-4"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Inventory File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && selectedAnalysisId && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <button
                onClick={clearSelectedAnalysis}
                className="inline-flex items-center space-x-2 text-white/60 hover:text-white"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            {/* Loading state */}
            {loadingAnalysisDetails && (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60">Loading analysis details...</p>
              </div>
            )}
            
            {/* Error state */}
            {analysisError && !loadingAnalysisDetails && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <h3 className="text-lg font-medium text-red-300">Error Loading Analysis</h3>
                </div>
                <p className="text-red-200 mb-4">{analysisError}</p>
                <button
                  onClick={clearSelectedAnalysis}
                  className="text-white/60 hover:text-white text-sm font-medium"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
            
            {/* Success state - Analysis details */}
            {analysisDetails && !loadingAnalysisDetails && !analysisError && (
              <div className="space-y-8">
                {/* Analysis Overview */}
                <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                  <h2 className="text-2xl font-light text-white mb-4">Analysis Overview</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/20 rounded p-4 text-center">
                      <div className="text-2xl font-light text-white">{analysisDetails.summary?.totalSKUs || 0}</div>
                      <div className="text-xs text-white/60">SKUs</div>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded p-4 text-center">
                      <div className="text-2xl font-light text-green-400">{analysisDetails.summary?.priceIncreases || 0}</div>
                      <div className="text-xs text-green-300">Increases</div>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-4 text-center">
                      <div className="text-2xl font-light text-red-400">{analysisDetails.summary?.priceDecreases || 0}</div>
                      <div className="text-xs text-red-300">Decreases</div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/20 rounded p-4 text-center">
                      <div className="text-2xl font-light text-white">
                        £{Math.round(analysisDetails.summary?.totalRevenuePotential || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/60">Revenue</div>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded p-4 text-center">
                      <div className="text-2xl font-light text-orange-400">
                        {Array.isArray(analysisDetails.competitorData) ? analysisDetails.competitorData.length : 0}
                      </div>
                      <div className="text-xs text-orange-300">Competitor</div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/20 rounded p-4 text-center">
                      <div className="text-2xl font-light text-white">
                        {seasonalStrategies.length}
                      </div>
                      <div className="text-xs text-white/60">Seasonal</div>
                    </div>
                  </div>
                </div>
                
                {/* Analysis Detail Tabs */}
                <div className="border-b border-white/20">
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
                          className={`group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            isActive
                              ? "border-white text-white"
                              : "border-transparent text-white/60 hover:text-white/80 hover:border-white/30"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${
                            isActive ? "text-white" : "text-white/40 group-hover:text-white/60"
                          }`} />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Tab Content - Seasonal Strategies */}
                {activeDetailTab === 'seasonal' && (
                  <div className="space-y-6">
                    {seasonalStrategies.length > 0 ? (
                      <div className="space-y-6">
                        {/* Seasonal Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                          <div className="bg-green-500/10 border border-green-500/20 rounded p-4">
                            <div className="text-2xl font-light text-green-400">
                              {seasonalStrategies.length}
                            </div>
                            <div className="text-sm text-green-300">Seasonal Strategies</div>
                          </div>
                          
                          <div className="bg-white/5 border border-white/20 rounded p-4">
                            <div className="text-2xl font-light text-white">
                              £{Math.round(seasonalStrategies.reduce((sum, s) => sum + (s.estimated_revenue_impact || 0), 0)).toLocaleString()}
                            </div>
                            <div className="text-sm text-white/60">Revenue Potential</div>
                          </div>
                          
                          <div className="bg-red-500/10 border border-red-500/20 rounded p-4">
                            <div className="text-2xl font-light text-red-400">
                              {seasonalStrategies.filter(s => s.urgency === 'high' || s.urgency === 'critical').length}
                            </div>
                            <div className="text-sm text-red-300">Urgent Actions</div>
                          </div>
                          
                          <div className="bg-white/5 border border-white/20 rounded p-4">
                            <div className="text-2xl font-light text-white">
                              £{seasonalStrategies.length > 0 ? Math.max(...seasonalStrategies.map(s => s.estimated_revenue_impact || 0)).toLocaleString() : '0'}
                            </div>
                            <div className="text-sm text-white/60">Top Opportunity</div>
                          </div>
                        </div>

                        {/* Seasonal Strategies Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {seasonalStrategies.map((strategy, index) => {
                            const urgencyColors = {
                              critical: 'border-red-400/30 bg-red-500/10',
                              high: 'border-orange-400/30 bg-orange-500/10', 
                              medium: 'border-yellow-400/30 bg-yellow-500/10',
                              low: 'border-white/30 bg-white/5'
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
                            const urgencyStyle = urgencyColors[strategy.urgency as keyof typeof urgencyColors] || 'border-white/30 bg-white/5'
                            const isExpanded = expandedStrategies.has(strategy.id || `strategy-${index}`)
                            
                            return (
                              <div 
                                key={strategy.id || `strategy-${index}`}
                                className={`border rounded-lg overflow-hidden hover:border-white/40 transition-colors ${urgencyStyle}`}
                              >
                                {/* Strategy Header */}
                                <div className="p-6 border-b border-white/10">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-white/60" />
                                      </div>
                                      <div>
                                        <h3 className="font-medium text-white">{strategy.title}</h3>
                                        <p className="text-sm text-white/60">{strategy.type.replace(/_/g, ' ').toUpperCase()}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-light text-white">£{Math.round(strategy.estimated_revenue_impact).toLocaleString()}</div>
                                      <div className="text-xs text-white/60">POTENTIAL</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Strategy Content */}
                                <div className="p-6 space-y-4">
                                  {/* Description */}
                                  <p className="text-white/80 text-sm leading-relaxed">{strategy.description}</p>
                                  
                                  {/* Urgency & Timeline */}
                                  <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                                      strategy.urgency === 'critical' ? 'bg-red-400/20 text-red-300 border border-red-400/30' :
                                      strategy.urgency === 'high' ? 'bg-orange-400/20 text-orange-300 border border-orange-400/30' :
                                      strategy.urgency === 'medium' ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' :
                                      'bg-white/10 text-white/70 border border-white/20'
                                    }`}>
                                      {strategy.urgency.toUpperCase()} URGENCY
                                    </span>
                                    {strategy.implementation_timeline && (
                                      <span className="text-sm text-white/60">
                                        Timeline: {strategy.implementation_timeline}
                                      </span>
                                    )}
                                  </div>

                                  {/* Expandable Content */}
                                  <div className="border-t border-white/10 pt-4">
                                    <button
                                      onClick={() => toggleStrategyExpansion(strategy.id || `strategy-${index}`)}
                                      className="flex items-center justify-between w-full text-left font-medium text-white hover:text-white/80 transition-colors"
                                    >
                                      <span>See Details</span>
                                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </button>
                                    
                                    {isExpanded && (
                                      <div className="mt-4 space-y-4">
                                        {/* Seasonal Context */}
                                        {strategy.reasoning && (
                                          <div className="bg-white/5 border border-white/20 rounded p-3">
                                            <div className="flex items-center space-x-2 mb-2">
                                              <Calendar className="h-4 w-4 text-white/60" />
                                              <span className="font-medium text-white/80">Seasonal Context</span>
                                            </div>
                                            <p className="text-white/70 text-sm">{strategy.reasoning}</p>
                                            {strategy.seasonal_trigger && (
                                              <p className="text-white/60 text-xs mt-1 font-medium">
                                                Trigger: {strategy.seasonal_trigger}
                                              </p>
                                            )}
                                          </div>
                                        )}

                                        {/* Products Involved */}
                                        {strategy.products_involved.length > 0 && (
                                          <div className="bg-white/5 border border-white/20 rounded p-3">
                                            <h4 className="font-medium text-white/80 mb-2">Products Involved:</h4>
                                            <div className="flex flex-wrap gap-2">
                                              {strategy.products_involved.slice(0, 4).map((sku, skuIndex) => (
                                                <span key={skuIndex} className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white/70">
                                                  {String(sku)}
                                                </span>
                                              ))}
                                              {strategy.products_involved.length > 4 && (
                                                <span className="px-2 py-1 bg-white/5 rounded text-xs text-white/50">
                                                  +{strategy.products_involved.length - 4} more
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Action Steps */}
                                        {strategy.execution_steps.length > 0 && (
                                          <div>
                                            <h4 className="font-medium text-white/80 mb-3">Execution Steps:</h4>
                                            <div className="space-y-2">
                                              {strategy.execution_steps.map((step, stepIndex) => (
                                                <div key={stepIndex} className="flex items-start space-x-2">
                                                  <span className="w-5 h-5 bg-white/20 text-white/80 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                                                    {stepIndex + 1}
                                                  </span>
                                                  <span className="text-sm text-white/70">{String(step)}</span>
                                                </div>
                                              ))}
                                            </div>
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
                      <div className="text-center py-12 bg-white/5 border border-white/20 rounded-lg">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-white/40" />
                        </div>
                        <h3 className="text-xl font-light text-white mb-2">No Seasonal Strategies Generated</h3>
                        <p className="text-white/60 mb-4 text-sm">
                          Seasonal recommendations require inventory data and current seasonal opportunities.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content - Recommendations */}
                {activeDetailTab === 'recommendations' && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Price Recommendations */}
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-green-500/20 rounded flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white">Top Revenue Opportunities</h3>
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
                              const bgColor = isIncrease ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                              const textColor = isIncrease ? 'text-green-400' : 'text-red-400'
                              
                              return (
                                <div key={index} className={`p-4 rounded border ${bgColor}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-white">{sku}</span>
                                    <span className={`font-medium ${textColor}`}>
                                      {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="text-sm text-white/70">
                                    <p className="font-medium">£{currentPrice.toFixed(2)} → £{recommendedPrice.toFixed(2)}</p>
                                    <p className="mt-1 text-white/60">{rec.reason || 'Price adjustment recommended'}</p>
                                    
                                    {revenueImpact !== 0 && (
                                      <p className="mt-2 text-xs font-medium text-green-400">
                                        £{Math.abs(Math.round(revenueImpact)).toLocaleString()} potential impact
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                        ) : (
                          <div className="text-center py-8 text-white/60 bg-white/5 rounded border border-white/20">
                            <TrendingUp className="h-12 w-12 text-white/30 mx-auto mb-3" />
                            <p>No price recommendations available</p>
                            <p className="text-sm text-white/50">Upload inventory data with prices to generate recommendations</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Risk Alerts */}
                    <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-red-500/20 rounded flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white">Priority Alerts</h3>
                      </div>
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {Array.isArray(analysisDetails.criticalAlerts) && analysisDetails.criticalAlerts.length > 0 ? (
                          analysisDetails.criticalAlerts.slice(0, 8).map((alert, index) => (
                            <div 
                              key={index} 
                              className={`p-4 rounded border ${
                                alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-white">{alert.product_sku || alert.sku_code || 'Unknown'}</span>
                                <span className={`font-medium text-xs px-2 py-1 rounded ${
                                  alert.severity === 'critical' ? 'bg-red-400/20 text-red-300' : 'bg-orange-400/20 text-orange-300'
                                }`}>
                                  {alert.severity || 'High'}
                                </span>
                              </div>
                              <div className="text-sm text-white/70">
                                <p>{alert.message || 'No details available'}</p>
                                {alert.estimated_impact && (
                                  <p className="text-xs mt-1 text-red-400">
                                    £{Math.round(parseFloat(alert.estimated_impact)).toLocaleString()} at risk
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-white/60">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-white/30" />
                            <p>No critical alerts</p>
                            <p className="text-sm text-white/50">All products have healthy stock levels</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content - Competitive */}
                {activeDetailTab === 'competitive' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/20 rounded-lg overflow-hidden">
                      <div className="px-6 py-4 border-b border-white/10">
                        <h3 className="text-lg font-medium text-white">Competitive Price Analysis</h3>
                        <p className="text-sm text-white/60">Real-time pricing intelligence from UK alcohol retailers</p>
                      </div>
                      
                      {Array.isArray(analysisDetails.competitorData) && analysisDetails.competitorData.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-white/5">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Our Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Competitor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Their Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Difference</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {analysisDetails.competitorData.slice(0, 15).map((comp, index) => {
                                const ourPrice = parseFloat(comp.our_price) || 0
                                const competitorPrice = parseFloat(comp.competitor_price) || 0
                                const priceDiffPercentage = parseFloat(comp.price_difference_percentage) || 0
                                const priceDifference = parseFloat(comp.price_difference) || 0
                                
                                return (
                                  <tr key={index} className="hover:bg-white/5">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="font-medium text-white">{comp.sku || 'Unknown'}</div>
                                      {comp.product_name && (
                                        <div className="text-sm text-white/60">{comp.product_name}</div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-lg font-medium text-white">£{ourPrice.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-white">{comp.competitor || 'Unknown'}</div>
                                      {comp.availability !== undefined && (
                                        <div className={`text-xs ${comp.availability ? 'text-green-400' : 'text-red-400'}`}>
                                          {comp.availability ? 'Available' : 'Out of stock'}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-lg font-medium text-white">£{competitorPrice.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                        priceDiffPercentage > 10 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                        priceDiffPercentage < -10 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                        'bg-white/10 text-white/70 border border-white/20'
                                      }`}>
                                        {priceDiffPercentage > 0 ? '+' : ''}{priceDiffPercentage.toFixed(1)}%
                                      </div>
                                      <div className="text-xs text-white/50 mt-1">
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
                        <div className="text-center py-12 text-white/60">
                          <Target className="h-12 w-12 mx-auto mb-3 text-white/30" />
                          <p>No competitor data available</p>
                          <p className="text-sm text-white/50">Try adding more recognized brands to your inventory</p>
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
                        <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                              <Lightbulb className="h-5 w-5 text-white/60" />
                            </div>
                            <div>
                              <h3 className="text-xl font-medium text-white">{insight.title || 'Market Insight'}</h3>
                              <div className="text-sm text-white/60">Market Intelligence</div>
                            </div>
                          </div>
                          
                          <p className="text-white/80 mb-4 text-sm">{insight.description || 'No description available'}</p>
                          
                          {Array.isArray(insight.actionable_steps) && insight.actionable_steps.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <h4 className="font-medium text-white">Recommended Actions:</h4>
                              <ul className="space-y-1">
                                {insight.actionable_steps.map((step: string, stepIdx: number) => (
                                  <li key={stepIdx} className="flex items-start space-x-2">
                                    <div className="w-1 h-1 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-sm text-white/70">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white/5 border border-white/20 rounded-lg">
                        <Brain className="h-12 w-12 mx-auto mb-3 text-white/30" />
                        <p className="text-white/60">No market insights available</p>
                        <p className="text-sm text-white/50">Insights are generated based on your inventory data and market trends</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}