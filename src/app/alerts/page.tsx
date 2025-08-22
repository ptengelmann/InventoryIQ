// CREATE NEW FILE: /app/alerts/page.tsx
// Comprehensive Alert Management Page

'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { AlertDashboard } from '@/components/ui/alert-dashboard'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  AlertTriangle, 
  Bell, 
  TrendingUp, 
  Package, 
  DollarSign,
  Calendar,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ArrowRight,
  Settings,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysisWithAlerts {
  uploadId: string
  fileName: string
  processedAt: string
  totalSKUs: number
  alertCount: number
  criticalAlerts: number
  unreadAlerts: number
  resolvedAlerts: number
}

interface AlertStats {
  totalAlerts: number
  criticalAlerts: number
  unreadAlerts: number
  resolvedAlerts: number
  acknowledgementRate: number
  resolutionRate: number
}

export default function AlertManagementPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  
  const [analyses, setAnalyses] = useState<AnalysisWithAlerts[]>([])
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'unread'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showManagement, setShowManagement] = useState(false)

  // Fetch data
  useEffect(() => {
    if (user) {
      fetchAnalyses()
    }
  }, [user])

  useEffect(() => {
    if (analyses.length > 0) {
      calculateAlertStats()
    }
  }, [analyses])

const fetchAnalyses = async () => {
  if (!user) {
    setError('User not authenticated')
    return
  }

  try {
    setLoading(true)
    setError(null)
    
    console.log('Fetching analyses for user:', user.email)
    const response = await fetch(`/api/alerts/manage?userId=${user.email}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch analyses')
    }
    
    setAnalyses(data.analyses || [])
  } catch (err) {
    console.error('Fetch analyses error:', err)
    setError(err instanceof Error ? err.message : 'An error occurred')
  } finally {
    setLoading(false)
  }
}

  const calculateAlertStats = () => {
    const totalAlerts = analyses.reduce((sum, a) => sum + a.alertCount, 0)
    const criticalAlerts = analyses.reduce((sum, a) => sum + a.criticalAlerts, 0)
    const unreadAlerts = analyses.reduce((sum, a) => sum + a.unreadAlerts, 0)
    const resolvedAlerts = analyses.reduce((sum, a) => sum + a.resolvedAlerts, 0)
    
    setAlertStats({
      totalAlerts,
      criticalAlerts,
      unreadAlerts,
      resolvedAlerts,
      acknowledgementRate: totalAlerts > 0 ? ((totalAlerts - unreadAlerts) / totalAlerts * 100) : 0,
      resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts * 100) : 0
    })
  }

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!confirm('Are you sure you want to delete this entire analysis and all its alerts? This action cannot be undone.')) return
    
    try {
      setDeleting(analysisId)
      const response = await fetch(`/api/alerts/manage?analysisId=${analysisId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAnalyses(prev => prev.filter(a => a.uploadId !== analysisId))
        if (selectedAnalysis === analysisId) {
          setSelectedAnalysis(null)
        }
      } else {
        const data = await response.json()
        alert(`Failed to delete analysis: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to delete analysis:', error)
      alert('Failed to delete analysis. Please try again.')
    } finally {
      setDeleting(null)
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

  const filteredAnalyses = analyses.filter(analysis => {
    switch (filter) {
      case 'critical':
        return analysis.criticalAlerts > 0
      case 'unread':
        return analysis.unreadAlerts > 0
      default:
        return true
    }
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading alert management...</p>
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
            <p className="text-gray-600">Please sign in to access alert management.</p>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage all your inventory alerts across analyses.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAnalyses}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => router.push('/analytics')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Error Loading Data</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchAnalyses}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Alert Statistics */}
        {alertStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{alertStats.totalAlerts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{alertStats.criticalAlerts}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Acknowledgement Rate</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round(alertStats.acknowledgementRate)}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{Math.round(alertStats.resolutionRate)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analysis List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Analyses</h2>
                  <button
                    onClick={() => setShowManagement(!showManagement)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Filter Buttons */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'all', label: 'All', count: analyses.length },
                    { key: 'critical', label: 'Critical', count: analyses.filter(a => a.criticalAlerts > 0).length },
                    { key: 'unread', label: 'Unread', count: analyses.filter(a => a.unreadAlerts > 0).length }
                  ].map(filterOption => (
                    <button
                      key={filterOption.key}
                      onClick={() => setFilter(filterOption.key as any)}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 text-center",
                        filter === filterOption.key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {filterOption.label}
                      {filterOption.count > 0 && (
                        <span className="ml-1 text-xs">({filterOption.count})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredAnalyses.length === 0 ? (
                  <div className="p-6 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No analyses found</p>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Create your first analysis
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 p-3">
                    {filteredAnalyses.map((analysis) => (
                      <div
                        key={analysis.uploadId}
                        className={cn(
                          "p-4 rounded-lg cursor-pointer transition-all",
                          selectedAnalysis === analysis.uploadId
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        )}
                        onClick={() => setSelectedAnalysis(analysis.uploadId)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate flex-1">
                            {analysis.fileName}
                          </h3>
                          {analysis.criticalAlerts > 0 && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                              {analysis.criticalAlerts} critical
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {formatDate(analysis.processedAt)}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600">
                              {analysis.totalSKUs} SKUs
                            </span>
                            <span className="text-gray-600">
                              {analysis.alertCount} alerts
                            </span>
                          </div>
                          
                          {showManagement && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAnalysis(analysis.uploadId)
                              }}
                              disabled={deleting === analysis.uploadId}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              {deleting === analysis.uploadId ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {analysis.unreadAlerts > 0 && (
                          <div className="mt-2 text-xs text-orange-600">
                            {analysis.unreadAlerts} unread alerts
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alert Details */}
          <div className="lg:col-span-2">
            {selectedAnalysis ? (
              <AlertDashboard 
                analysisId={selectedAnalysis}
                onAcknowledge={(alertId) => {
                  console.log('Acknowledged alert:', alertId)
                  // Refresh the analysis list to update counts
                  fetchAnalyses()
                }}
                onResolve={(alertId) => {
                  console.log('Resolved alert:', alertId)
                  // Refresh the analysis list to update counts
                  fetchAnalyses()
                }}
                onDelete={(alertId) => {
                  console.log('Deleted alert:', alertId)
                  // Refresh the analysis list to update counts
                  fetchAnalyses()
                }}
              />
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Select an Analysis</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Choose an analysis from the list to view and manage its alerts.
                </p>
                {analyses.length === 0 && (
                  <button
                    onClick={() => router.push('/analytics')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Create First Analysis</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}