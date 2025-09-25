'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  Clock, 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Package,
  DollarSign,
  Filter,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  BarChart3,
  Wine,
  ArrowRight,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Activity
} from 'lucide-react'

interface HistoryAnalysis {
  _id: string
  uploadId: string
  fileName: string
  uploadedAt: string
  processedAt: string
  summary: {
    totalSKUs: number
    priceIncreases: number
    priceDecreases: number
    totalRevenuePotential: number
  }
  alertCount?: number
  status: 'completed' | 'processing' | 'failed'
}

interface HistoryStats {
  totalAnalyses: number
  totalSKUsAnalyzed: number
  totalRevenuePotential: number
  alertsGenerated: number
  avgProcessingTime: number
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  
  // History data state
  const [analyses, setAnalyses] = useState<HistoryAnalysis[]>([])
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'revenue' | 'skus'>('date')
  
  // UI state
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch history data when user is available
  useEffect(() => {
    if (user) {
      fetchHistoryData()
    }
  }, [user])

  const fetchHistoryData = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      // Fetch analyses from database
      const analysesResponse = await fetch(`/api/dashboard/analyses?userId=${encodeURIComponent(user.email)}`)
      
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json()
        const formattedAnalyses: HistoryAnalysis[] = (analysesData.analyses || []).map((analysis: any) => ({
          _id: analysis._id,
          uploadId: analysis.uploadId,
          fileName: analysis.fileName,
          uploadedAt: analysis.uploadedAt,
          processedAt: analysis.processedAt,
          summary: analysis.summary || {
            totalSKUs: 0,
            priceIncreases: 0,
            priceDecreases: 0,
            totalRevenuePotential: 0
          },
          alertCount: (analysis.alerts || []).length,
          status: 'completed' as const
        }))
        
        setAnalyses(formattedAnalyses)
        
        // Calculate stats from analyses
        const calculatedStats: HistoryStats = {
          totalAnalyses: formattedAnalyses.length,
          totalSKUsAnalyzed: formattedAnalyses.reduce((sum, a) => sum + (a.summary.totalSKUs || 0), 0),
          totalRevenuePotential: formattedAnalyses.reduce((sum, a) => sum + (a.summary.totalRevenuePotential || 0), 0),
          alertsGenerated: formattedAnalyses.reduce((sum, a) => sum + (a.alertCount || 0), 0),
          avgProcessingTime: 2.3 // Would be calculated from actual processing times
        }
        
        setStats(calculatedStats)
      } else {
        throw new Error('Failed to fetch analyses')
      }
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('Failed to load history data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) return
    
    try {
      setDeleting(analysisId)
      // Add delete API call here when implemented
      console.log('Delete analysis:', analysisId)
      
      // For now, just remove from state
      setAnalyses(prev => prev.filter(a => a._id !== analysisId))
      
    } catch (error) {
      console.error('Failed to delete analysis:', error)
      alert('Failed to delete analysis. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const downloadAnalysisReport = (analysis: HistoryAnalysis) => {
    // Generate CSV report
    const csvContent = `Analysis Report - ${analysis.fileName}\n` +
      `Generated: ${new Date().toISOString()}\n\n` +
      `Total SKUs Analyzed: ${analysis.summary.totalSKUs}\n` +
      `Price Increases Recommended: ${analysis.summary.priceIncreases}\n` +
      `Price Decreases Recommended: ${analysis.summary.priceDecreases}\n` +
      `Revenue Potential: £${analysis.summary.totalRevenuePotential}\n` +
      `Alerts Generated: ${analysis.alertCount || 0}`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${analysis.fileName}-report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getFilteredAnalyses = () => {
    let filtered = analyses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const days = parseInt(dateFilter.replace('d', ''))
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(analysis => 
        new Date(analysis.processedAt) >= cutoff
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return (b.summary.totalRevenuePotential || 0) - (a.summary.totalRevenuePotential || 0)
        case 'skus':
          return (b.summary.totalSKUs || 0) - (a.summary.totalSKUs || 0)
        case 'date':
        default:
          return new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
      }
    })

    return filtered
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

  // Show loading state
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
            <h2 className="text-3xl font-light text-white">Access Required</h2>
            <p className="text-white/60">Please sign in to view your analysis history.</p>
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

  const filteredAnalyses = getFilteredAnalyses()

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 border border-white/20 rounded mb-8">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-white/60 text-sm">Analysis tracking & insights</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-light text-white leading-tight mb-4">
                Analysis history
                <br />
                <span className="text-white/60">optimization journey</span>
              </h1>
              <p className="text-base md:text-lg text-white/60 leading-relaxed">
                Track your alcohol inventory optimization journey and measure impact over time.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchHistoryData}
                className="inline-flex items-center space-x-2 px-4 py-3 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => router.push('/analytics')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
              >
                <Activity className="h-5 w-5" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="font-medium text-red-300">Error Loading History</h3>
            </div>
            <p className="text-red-200 mb-4">{error}</p>
            <button 
              onClick={fetchHistoryData}
              className="text-red-300 hover:text-red-100 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/5 border border-white/20 rounded p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Total Analyses</p>
                  <p className="text-2xl font-light text-white">{stats.totalAnalyses}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white/60" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">SKUs Analyzed</p>
                  <p className="text-2xl font-light text-white">{stats.totalSKUsAnalyzed.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                  <Package className="h-6 w-6 text-white/60" />
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Revenue Potential</p>
                  <p className="text-2xl font-light text-green-400">£{Math.round(stats.totalRevenuePotential).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-300">Alerts Generated</p>
                  <p className="text-2xl font-light text-red-400">{stats.alertsGenerated}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Avg Processing</p>
                  <p className="text-2xl font-light text-white">{stats.avgProcessingTime}s</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search analyses..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-white/40" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded px-3 py-3 text-white focus:border-white/40 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-white/40" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded px-3 py-3 text-white focus:border-white/40 focus:outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="skus">Sort by SKUs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analysis List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white/5 border border-white/20 rounded-lg p-8 text-center">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60">Loading analyses...</p>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
              <Activity className="h-16 w-16 text-white/40 mx-auto mb-6" />
              <h3 className="text-xl font-light text-white mb-4">No analyses found</h3>
              <p className="text-white/60 mb-8 text-sm">
                {analyses.length === 0 
                  ? "Start by uploading your first alcohol inventory file to see your optimization journey."
                  : "No analyses match your current filters. Try adjusting your search criteria."
                }
              </p>
              <button
                onClick={() => router.push('/analytics')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
              >
                <Activity className="h-5 w-5" />
                <span>Create First Analysis</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            filteredAnalyses.map((analysis) => (
              <div
                key={analysis._id}
                className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{analysis.fileName}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-white/60 mb-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(analysis.processedAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{analysis.summary.totalSKUs} SKUs</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>£{Math.round(analysis.summary.totalRevenuePotential).toLocaleString()} potential</span>
                      </span>
                      {analysis.alertCount && analysis.alertCount > 0 && (
                        <span className="flex items-center space-x-1">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{analysis.alertCount} alerts</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="text-lg font-light text-green-400">{analysis.summary.priceIncreases}</div>
                        <div className="text-xs text-green-300">Price Increases</div>
                      </div>
                      <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded">
                        <div className="text-lg font-light text-red-400">{analysis.summary.priceDecreases}</div>
                        <div className="text-xs text-red-300">Price Decreases</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 border border-white/20 rounded">
                        <div className="text-lg font-light text-white">
                          {analysis.summary.totalSKUs - analysis.summary.priceIncreases - analysis.summary.priceDecreases}
                        </div>
                        <div className="text-xs text-white/60">No Change</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard?analysis=${analysis.uploadId}`)}
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    <button
                      onClick={() => downloadAnalysisReport(analysis)}
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAnalysis(analysis._id)}
                      disabled={deleting === analysis._id}
                      className="inline-flex items-center space-x-1 px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                    >
                      {deleting === analysis._id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}