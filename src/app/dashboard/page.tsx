'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { HistoryDashboard } from '@/components/ui/history-dashboard'
import { AlertDashboard } from '@/components/ui/alert-dashboard'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  BarChart3, 
  Bell, 
  Clock, 
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  FileText,
  Plus,
  ArrowRight,
  RefreshCw,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalAnalyses: number
  totalSKUs: number
  totalRevenuePotential: number
  avgSKUsPerAnalysis: number
  recentAnalyses: number
}

interface AnalysisRecord {
  _id: string
  uploadId: string
  fileName: string
  uploadedAt: string
  processedAt: string
  summary: {
    totalSKUs: number
    priceIncreases: number
    priceDecreases: number
    noChange: number
    highRiskSKUs: number
    mediumRiskSKUs: number
    totalRevenuePotential: number
  }
}

interface Trends {
  skuGrowth: number
  revenueGrowth: number
  riskChange: number
  optimizationRate: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'history'>('overview')
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats | null
    recentAnalyses: AnalysisRecord[]
    trends: Trends | null
    hasHistory: boolean
  }>({
    stats: null,
    recentAnalyses: [],
    trends: null,
    hasHistory: false
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugMode, setDebugMode] = useState(false)

  // Fetch dashboard data with enhanced debugging
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
  if (!user) {
    setError('User not authenticated')
    return
  }

  try {
    setLoading(true)
    setError(null)
    
    console.log('Fetching dashboard data...')
    
    const response = await fetch(`/api/history?limit=5&userId=${user.email}&userEmail=${user.email}`)
    const data = await response.json()
      
      console.log('Dashboard API Response:', {
        status: response.status,
        ok: response.ok,
        hasHistory: data.hasHistory,
        statsPresent: !!data.stats,
        analysesCount: data.recentAnalyses?.length || 0,
        data: data
      })
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard data')
      }
      
      // Validate data structure
      if (data.hasHistory && (!data.stats || !data.recentAnalyses)) {
        console.warn('Invalid data structure returned from API')
        throw new Error('Invalid dashboard data structure')
      }
      
      setDashboardData(data)
      
      if (data.hasHistory) {
        console.log('Real data loaded:', {
          analyses: data.stats?.totalAnalyses,
          skus: data.stats?.totalSKUs,
          revenue: data.stats?.totalRevenuePotential
        })
      } else {
        console.log('No history found - showing welcome state')
      }
      
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Debug function to test all APIs
  const debugAPIs = async () => {
    console.log('Testing all APIs...')
    
    try {
      // Test history API
      const historyRes = await fetch('/api/history')
      const historyData = await historyRes.json()
      console.log('History API:', { 
        status: historyRes.status, 
        hasHistory: historyData.hasHistory,
        stats: historyData.stats,
        analyses: historyData.recentAnalyses?.length
      })
      
      // Test alerts API
      const alertsRes = await fetch('/api/alerts/latest')
      const alertsData = await alertsRes.json()
      console.log('Alerts API:', { 
        status: alertsRes.status, 
        success: alertsData.success,
        count: alertsData.alerts?.length 
      })
      
      // Test alert stats
      const statsRes = await fetch('/api/alerts/stats')
      const statsData = await statsRes.json()
      console.log('Stats API:', { 
        status: statsRes.status, 
        totalAlerts: statsData.totalAlerts 
      })
      
      // Test MongoDB connection by checking if we can save/read
      console.log('Database connection test complete')
      
    } catch (error) {
      console.error('API test failed:', error)
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
    // Refresh data after login
    fetchDashboardData()
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

  // Redirect to home if not logged in
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
            <p className="text-gray-600">Please sign in to view your dashboard.</p>
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

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3
    },
    {
      id: 'alerts',
      label: 'Smart Alerts',
      icon: Bell
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: Clock
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Track your inventory optimization progress and insights.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchDashboardData}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                <span className="text-sm">Refresh</span>
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <Database className="h-4 w-4" />
                  <span className="text-sm">Debug</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Debug Panel (Development Only) */}
        {debugMode && process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-3">Debug Tools</h4>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={debugAPIs}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                >
                  Test All APIs
                </button>
                <button
                  onClick={() => console.log('Dashboard State:', dashboardData)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                >
                  Log Dashboard State
                </button>
                <button
                  onClick={() => {
                    fetch('/api/upload', { method: 'OPTIONS' })
                      .then(() => console.log('Upload API accessible'))
                      .catch(err => console.error('Upload API error:', err))
                  }}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                  Test Upload API
                </button>
              </div>
              <div className="text-sm text-yellow-700">
                <p>Has History: {dashboardData.hasHistory ? 'Yes' : 'No'}</p>
                <p>Stats Available: {dashboardData.stats ? 'Yes' : 'No'}</p>
                <p>Recent Analyses: {dashboardData.recentAnalyses.length}</p>
                {error && <p className="text-red-600">Error: {error}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm",
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-medium text-red-900">Error Loading Dashboard</h3>
                </div>
                <p className="text-red-700 mb-3">{error}</p>
                <div className="space-x-2">
                  <button 
                    onClick={fetchDashboardData}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                  >
                    Try Again
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      onClick={debugAPIs}
                      className="text-red-600 hover:text-red-800 text-sm underline ml-4"
                    >
                      Debug APIs
                    </button>
                  )}
                </div>
              </div>
            ) : !dashboardData.hasHistory ? (
              /* No Analysis State */
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to InventoryIQ, {user.name}!
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Upload your first inventory CSV file to start getting AI-powered 
                  price recommendations and inventory risk alerts for your alcohol business.
                </p>
                
                <button
                  onClick={() => router.push('/analytics')}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  <span>Upload Your First Analysis</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Alcohol Price Optimization</h3>
                    <p className="text-gray-600 text-sm">AI-powered pricing for beer, wine, spirits with seasonal considerations</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Inventory Risk Detection</h3>
                    <p className="text-gray-600 text-sm">Prevent stockouts during peak seasons and manage expiration risks</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Alcohol Industry Insights</h3>
                    <p className="text-gray-600 text-sm">Track performance with alcohol-specific analytics and compliance</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Dashboard with Real Data */
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Analyses</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardData.stats?.totalAnalyses || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">SKUs Tracked</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardData.stats?.totalSKUs || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Revenue Potential</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${Math.round(dashboardData.stats?.totalRevenuePotential || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg SKUs/Analysis</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(dashboardData.stats?.avgSKUsPerAnalysis || 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Analysis Summary */}
                {dashboardData.recentAnalyses.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Latest Analysis</h3>
                      <button
                        onClick={() => router.push('/analytics')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Run New Analysis
                      </button>
                    </div>
                    
                    {(() => {
                      const latest = dashboardData.recentAnalyses[0]
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{latest.fileName}</h4>
                              <p className="text-sm text-gray-600">
                                Processed {new Date(latest.processedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              Latest
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{latest.summary.totalSKUs}</div>
                              <div className="text-sm text-gray-600">SKUs Analyzed</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{latest.summary.priceIncreases}</div>
                              <div className="text-sm text-gray-600">Price Increases</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                              <div className="text-2xl font-bold text-red-600">{latest.summary.highRiskSKUs}</div>
                              <div className="text-sm text-gray-600">High Risk SKUs</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <div className="text-2xl font-bold text-purple-600">
                                ${Math.round(latest.summary.totalRevenuePotential).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">Revenue Potential</div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Trends (if available) */}
                {dashboardData.trends && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">SKU Coverage</span>
                          <div className={cn(
                            "flex items-center space-x-1 text-sm font-medium",
                            dashboardData.trends.skuGrowth >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {dashboardData.trends.skuGrowth >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4 transform rotate-180" />
                            )}
                            <span>{Math.abs(dashboardData.trends.skuGrowth)} SKUs</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Revenue Opportunity</span>
                          <div className={cn(
                            "flex items-center space-x-1 text-sm font-medium",
                            dashboardData.trends.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {dashboardData.trends.revenueGrowth >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4 transform rotate-180" />
                            )}
                            <span>${Math.abs(dashboardData.trends.revenueGrowth).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Risk Management</span>
                          <div className={cn(
                            "flex items-center space-x-1 text-sm font-medium",
                            dashboardData.trends.riskChange <= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {dashboardData.trends.riskChange <= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingUp className="h-4 w-4 transform rotate-180" />
                            )}
                            <span>{Math.abs(dashboardData.trends.riskChange)} risk SKUs</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Optimizations Made</span>
                          <span className="text-blue-600 font-medium">
                            {dashboardData.trends.optimizationRate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="text-center">
                  <button
                    onClick={() => router.push('/analytics')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Run New Analysis</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <AlertDashboard 
            analysisId={dashboardData.recentAnalyses[0]?.uploadId}
            onAcknowledge={(alertId) => {
              console.log('Acknowledged alert:', alertId)
              // Refresh dashboard data to reflect changes
              fetchDashboardData()
            }}
            onResolve={(alertId) => {
              console.log('Resolved alert:', alertId)
              // Refresh dashboard data to reflect changes
              fetchDashboardData()
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard 
            onSelectAnalysis={(analysisId) => {
              console.log('Selected analysis:', analysisId)
              // Switch to alerts tab and show that analysis
              setActiveTab('alerts')
            }}
          />
        )}
      </main>
    </div>
  )
}