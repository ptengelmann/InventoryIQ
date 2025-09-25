// CREATE NEW FILE: /app/alerts/page.tsx
// Dark Theme Alert Management Page

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
  Plus,
  Search,
  Activity,
  Database,
  Shield,
  Target,
  Globe
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
  const [searchTerm, setSearchTerm] = useState('')

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
    const matchesSearch = searchTerm === '' || 
      analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = (() => {
      switch (filter) {
        case 'critical':
          return analysis.criticalAlerts > 0
        case 'unread':
          return analysis.unreadAlerts > 0
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesFilter
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
      <div className="min-h-screen bg-black">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading alert management...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to auth if not logged in
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
            <div className="w-16 h-16 bg-white/10 rounded flex items-center justify-center mx-auto">
              <Bell className="h-8 w-8 text-white/60" />
            </div>
            <h2 className="text-3xl font-light text-white">Access Required</h2>
            <p className="text-white/60">Please sign in to access alert management.</p>
            <button
              onClick={handleLogin}
              className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-100 transition-colors"
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 border border-white/20 rounded">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              <span className="text-white/60 text-sm">Real-time alert monitoring</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-light text-white leading-tight">
              Alert management system
              <br />
              <span className="text-white/60">for inventory intelligence</span>
            </h1>

            <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
              Monitor and manage all inventory alerts across your analyses. 
              Take action on critical stockouts, overstocks, and pricing opportunities.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                <span>Real-time monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
                <span>Smart alert prioritization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
                <span>Action tracking</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-red-300">Error Loading Data</h3>
                  <p className="text-red-200">{error}</p>
                </div>
              </div>
              <button 
                onClick={fetchAnalyses}
                className="bg-white text-black px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Alert Statistics */}
          {alertStats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { 
                  label: 'Total Alerts', 
                  value: alertStats.totalAlerts, 
                  icon: Bell,
                  description: 'Active monitoring points'
                },
                { 
                  label: 'Critical Alerts', 
                  value: alertStats.criticalAlerts, 
                  icon: AlertTriangle,
                  description: 'Immediate attention required',
                  color: 'text-red-400'
                },
                { 
                  label: 'Unread Alerts', 
                  value: alertStats.unreadAlerts, 
                  icon: Clock,
                  description: 'Awaiting acknowledgment',
                  color: 'text-orange-400'
                },
                { 
                  label: 'Acknowledgement Rate', 
                  value: `${Math.round(alertStats.acknowledgementRate)}%`, 
                  icon: CheckCircle,
                  description: 'Team responsiveness',
                  color: 'text-green-400'
                },
                { 
                  label: 'Resolution Rate', 
                  value: `${Math.round(alertStats.resolutionRate)}%`, 
                  icon: Target,
                  description: 'Action completion',
                  color: 'text-green-400'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white/5 border border-white/20 rounded p-6 hover:bg-white/8 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-8 w-8 ${stat.color || 'text-white/60'}`} />
                    <div className={`text-3xl font-light ${stat.color || 'text-white'}`}>{stat.value}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{stat.label}</div>
                    <div className="text-xs text-white/50">{stat.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
                />
              </div>
              
              <div className="flex items-center space-x-1 bg-white/10 rounded p-1">
                {[
                  { key: 'all', label: 'All', count: analyses.length },
                  { key: 'critical', label: 'Critical', count: analyses.filter(a => a.criticalAlerts > 0).length },
                  { key: 'unread', label: 'Unread', count: analyses.filter(a => a.unreadAlerts > 0).length }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={cn(
                      "px-4 py-2 rounded text-sm font-medium transition-colors",
                      filter === filterOption.key
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {filterOption.label}
                    {filterOption.count > 0 && (
                      <span className="ml-1">({filterOption.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowManagement(!showManagement)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 rounded transition-colors border",
                  showManagement 
                    ? "bg-white text-black border-white"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Manage</span>
              </button>
              
              <button
                onClick={fetchAnalyses}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-3 bg-white/10 border border-white/20 rounded hover:bg-white/15 transition-colors disabled:opacity-50 text-white"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => router.push('/analytics')}
                className="flex items-center space-x-2 px-4 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>

          {/* Main Content - Full Width Modern Layout */}
          {selectedAnalysis ? (
            <div className="space-y-6">
              {/* Analysis Header */}
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedAnalysis(null)}
                      className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      <span>Back to Analyses</span>
                    </button>
                    <div className="h-6 w-px bg-white/20"></div>
                    <div>
                      <h2 className="text-xl font-medium text-white">
                        {analyses.find(a => a.uploadId === selectedAnalysis)?.fileName || 'Unknown Analysis'}
                      </h2>
                      <p className="text-sm text-white/60">
                        {analyses.find(a => a.uploadId === selectedAnalysis)?.totalSKUs || 0} SKUs • {analyses.find(a => a.uploadId === selectedAnalysis)?.alertCount || 0} alerts
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const currentAnalysis = analyses.find(a => a.uploadId === selectedAnalysis)
                      if (!currentAnalysis) return null
                      
                      return (
                        <>
                          {currentAnalysis.criticalAlerts > 0 && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-300 text-sm font-medium rounded border border-red-500/30">
                              <AlertTriangle className="h-4 w-4" />
                              <span>{currentAnalysis.criticalAlerts} Critical</span>
                            </span>
                          )}
                          {currentAnalysis.unreadAlerts > 0 && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-500/20 text-orange-300 text-sm font-medium rounded border border-orange-500/30">
                              <Clock className="h-4 w-4" />
                              <span>{currentAnalysis.unreadAlerts} Unread</span>
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Alert Dashboard - Full Width */}
              <AlertDashboard 
                analysisId={selectedAnalysis}
                onAcknowledge={(alertId) => {
                  console.log('Acknowledged alert:', alertId)
                  fetchAnalyses()
                }}
                onResolve={(alertId) => {
                  console.log('Resolved alert:', alertId)
                  fetchAnalyses()
                }}
                onDelete={(alertId) => {
                  console.log('Deleted alert:', alertId)
                  fetchAnalyses()
                }}
              />
            </div>
          ) : (
            /* Analyses Grid */
            <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAnalyses.length === 0 ? (
                <div className="lg:col-span-3 xl:col-span-4">
                  <div className="bg-white/5 border border-white/20 rounded-lg p-16 text-center">
                    <div className="w-20 h-20 bg-white/10 rounded flex items-center justify-center mx-auto mb-8">
                      <FileText className="h-10 w-10 text-white/60" />
                    </div>
                    <h3 className="text-2xl font-light text-white mb-4">No analyses found</h3>
                    <p className="text-white/60 mb-8 max-w-md mx-auto text-sm">
                      {searchTerm || filter !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'Upload your first inventory CSV to get started with alert monitoring.'
                      }
                    </p>
                    {!searchTerm && filter === 'all' && (
                      <div className="space-y-6">
                        <button
                          onClick={() => router.push('/analytics')}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
                        >
                          <BarChart3 className="h-5 w-5" />
                          <span>Upload Inventory CSV</span>
                          <ArrowRight className="h-5 w-5" />
                        </button>
                        
                        <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                          <div className="p-4 bg-white/5 border border-white/20 rounded">
                            <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center mb-3">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                            </div>
                            <h4 className="font-medium text-white text-sm">Critical Alerts</h4>
                            <p className="text-xs text-white/60 mt-1">
                              Immediate stockout risks and urgent actions
                            </p>
                          </div>
                          
                          <div className="p-4 bg-white/5 border border-white/20 rounded">
                            <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center mb-3">
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            </div>
                            <h4 className="font-medium text-white text-sm">Price Opportunities</h4>
                            <p className="text-xs text-white/60 mt-1">
                              Competitive pricing and margin optimization
                            </p>
                          </div>
                          
                          <div className="p-4 bg-white/5 border border-white/20 rounded">
                            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center mb-3">
                              <Package className="h-4 w-4 text-white/60" />
                            </div>
                            <h4 className="font-medium text-white text-sm">Inventory Insights</h4>
                            <p className="text-xs text-white/60 mt-1">
                              Overstock management and clearance strategy
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                filteredAnalyses.map((analysis) => (
                  <div
                    key={analysis.uploadId}
                    className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/8 transition-all cursor-pointer group"
                    onClick={() => setSelectedAnalysis(analysis.uploadId)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center group-hover:bg-white/15 transition-colors">
                        <Package className="h-6 w-6 text-white/60" />
                      </div>
                      
                      {showManagement && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAnalysis(analysis.uploadId)
                          }}
                          disabled={deleting === analysis.uploadId}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        >
                          {deleting === analysis.uploadId ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-white text-lg mb-2 group-hover:text-white/80 transition-colors truncate">
                      {analysis.fileName}
                    </h3>
                    
                    <p className="text-sm text-white/60 mb-4">
                      {formatDate(analysis.processedAt)}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-light text-white">{analysis.totalSKUs}</div>
                        <div className="text-xs text-white/50">SKUs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-white">{analysis.alertCount}</div>
                        <div className="text-xs text-white/50">Alerts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-light text-red-400">{analysis.criticalAlerts}</div>
                        <div className="text-xs text-white/50">Critical</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {analysis.unreadAlerts > 0 && (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-500/20 text-orange-300 text-xs font-medium rounded border border-orange-500/30">
                          <Clock className="h-3 w-3" />
                          <span>{analysis.unreadAlerts} unread</span>
                        </span>
                      )}
                      
                      <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors ml-auto" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}