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
  competitivelyTrackedSKUs?: number
  totalCompetitorPrices?: number
  avgPriceDifference?: number
}

interface CompetitiveHistoryData {
  sku_code: string
  product_name: string
  our_price: number
  competitor_count: number
  avg_competitor_price: number
  last_scanned: string
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
  const [competitiveHistory, setCompetitiveHistory] = useState<CompetitiveHistoryData[]>([])

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'revenue' | 'skus'>('date')
  const [showCompetitiveTracking, setShowCompetitiveTracking] = useState(false)

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
      // Fetch analyses and competitive pricing data in parallel
      const [analysesResponse, competitivePricingResponse] = await Promise.all([
        fetch(`/api/dashboard/analyses?userId=${encodeURIComponent(user.email)}`),
        fetch(`/api/competitors/pricing?userId=${encodeURIComponent(user.email)}`)
      ])

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

        // Process competitive pricing data
        let competitiveStats = {
          competitivelyTrackedSKUs: 0,
          totalCompetitorPrices: 0,
          avgPriceDifference: 0
        }

        if (competitivePricingResponse.ok) {
          const competitiveData = await competitivePricingResponse.json()

          if (competitiveData.success && competitiveData.comparisons) {
            const competitiveProducts: CompetitiveHistoryData[] = competitiveData.comparisons
              .map((comp: any) => {
                const competitorPrices = comp.competitor_prices || []
                const avgPrice = competitorPrices.length > 0
                  ? competitorPrices.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / competitorPrices.length
                  : 0

                return {
                  sku_code: comp.sku,
                  product_name: comp.product_name || comp.sku,
                  our_price: comp.our_price || 0,
                  competitor_count: competitorPrices.length,
                  avg_competitor_price: avgPrice,
                  last_scanned: competitorPrices[0]?.last_updated || new Date().toISOString()
                }
              })
              .filter((p: CompetitiveHistoryData) => p.competitor_count > 0)

            setCompetitiveHistory(competitiveProducts)

            competitiveStats = {
              competitivelyTrackedSKUs: competitiveProducts.length,
              totalCompetitorPrices: competitiveProducts.reduce((sum, p) => sum + p.competitor_count, 0),
              avgPriceDifference: competitiveProducts.length > 0
                ? competitiveProducts.reduce((sum, p) => sum + (p.our_price - p.avg_competitor_price), 0) / competitiveProducts.length
                : 0
            }
          }
        }

        // Calculate stats from analyses
        const calculatedStats: HistoryStats = {
          totalAnalyses: formattedAnalyses.length,
          totalSKUsAnalyzed: formattedAnalyses.reduce((sum, a) => sum + (a.summary.totalSKUs || 0), 0),
          totalRevenuePotential: formattedAnalyses.reduce((sum, a) => sum + (a.summary.totalRevenuePotential || 0), 0),
          alertsGenerated: formattedAnalyses.reduce((sum, a) => sum + (a.alertCount || 0), 0),
          avgProcessingTime: 2.3, // Would be calculated from actual processing times
          ...competitiveStats
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
                onClick={() => router.push('/upload')}
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
          <div className="space-y-6 mb-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

            {/* Competitive Intelligence Stats */}
            {stats.competitivelyTrackedSKUs !== undefined && stats.competitivelyTrackedSKUs > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Competitive Intelligence Tracking</h3>
                      <p className="text-white/60 text-sm">Real-time market positioning insights</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCompetitiveTracking(!showCompetitiveTracking)}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    {showCompetitiveTracking ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                    <div className="text-3xl font-light text-blue-400 mb-1">
                      {stats.competitivelyTrackedSKUs}
                    </div>
                    <div className="text-sm text-blue-300">Products Tracked</div>
                    <div className="text-xs text-white/60 mt-1">
                      {((stats.competitivelyTrackedSKUs / stats.totalSKUsAnalyzed) * 100).toFixed(1)}% of inventory
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                    <div className="text-3xl font-light text-blue-400 mb-1">
                      {stats.totalCompetitorPrices || 0}
                    </div>
                    <div className="text-sm text-blue-300">Competitor Data Points</div>
                    <div className="text-xs text-white/60 mt-1">
                      Avg {((stats.totalCompetitorPrices || 0) / stats.competitivelyTrackedSKUs).toFixed(1)} per product
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                    <div className={`text-3xl font-light mb-1 ${
                      (stats.avgPriceDifference || 0) > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(stats.avgPriceDifference || 0) > 0 ? '+' : ''}£{Math.abs(stats.avgPriceDifference || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-300">Avg Price vs Market</div>
                    <div className="text-xs text-white/60 mt-1">
                      {(stats.avgPriceDifference || 0) > 0 ? 'Premium pricing' : 'Competitive pricing'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Competitive Tracking Details */}
        {showCompetitiveTracking && competitiveHistory.length > 0 && (
          <div className="bg-white/5 border border-white/20 rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-white font-semibold mb-1">Competitively Tracked Products</h3>
              <p className="text-white/60 text-sm">
                Products with live competitor pricing data from UK retailers
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-white/80">Product</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-white/80">SKU</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-white/80">Our Price</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-white/80">Market Avg</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-white/80">Difference</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-white/80">Data Points</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-white/80">Last Scanned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {competitiveHistory.slice(0, 10).map((product, idx) => {
                    const priceDiff = product.our_price - product.avg_competitor_price
                    const priceDiffPercent = ((priceDiff / product.avg_competitor_price) * 100).toFixed(1)

                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white text-sm">{product.product_name}</td>
                        <td className="px-6 py-4 text-white/60 text-sm font-mono">{product.sku_code}</td>
                        <td className="px-6 py-4 text-right text-white text-sm">
                          £{product.our_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-white/80 text-sm">
                          £{product.avg_competitor_price.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 text-right text-sm font-medium ${
                          priceDiff > 0 ? 'text-green-400' : priceDiff < 0 ? 'text-red-400' : 'text-white/60'
                        }`}>
                          {priceDiff > 0 ? '+' : ''}£{priceDiff.toFixed(2)}
                          <span className="text-xs ml-1">
                            ({priceDiff > 0 ? '+' : ''}{priceDiffPercent}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {product.competitor_count} retailer{product.competitor_count > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-white/60 text-sm">
                          {new Date(product.last_scanned).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {competitiveHistory.length > 10 && (
              <div className="p-4 border-t border-white/20 text-center">
                <p className="text-white/60 text-sm">
                  Showing 10 of {competitiveHistory.length} tracked products.{' '}
                  <button
                    onClick={() => router.push('/competitive')}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View all in Competitive Intelligence
                  </button>
                </p>
              </div>
            )}
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
                onClick={() => router.push('/upload')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
              >
                <Activity className="h-5 w-5" />
                <span>Create First Analysis</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            filteredAnalyses.map((analysis) => {
              const increasePercent = (analysis.summary.priceIncreases / analysis.summary.totalSKUs) * 100
              const decreasePercent = (analysis.summary.priceDecreases / analysis.summary.totalSKUs) * 100
              const noChangePercent = 100 - increasePercent - decreasePercent

              return (
                <div
                  key={analysis._id}
                  className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/20 rounded-xl overflow-hidden hover:border-white/30 transition-all hover:shadow-lg hover:shadow-white/5"
                >
                  {/* Header Section */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="h-5 w-5 text-white/60" />
                          <h3 className="text-xl font-medium text-white">{analysis.fileName}</h3>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-white/60">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(analysis.processedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                          <span className="mx-2">•</span>
                          <span>{Math.floor((new Date().getTime() - new Date(analysis.processedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Package className="h-5 w-5 text-blue-400" />
                          <span className="text-2xl font-light text-white">{analysis.summary.totalSKUs}</span>
                        </div>
                        <p className="text-xs text-white/60">SKUs Analyzed</p>
                      </div>

                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                          <span className="text-2xl font-light text-green-400">{analysis.summary.priceIncreases}</span>
                        </div>
                        <p className="text-xs text-green-300">Price Increases</p>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp className="h-5 w-5 text-red-400 rotate-180" />
                          <span className="text-2xl font-light text-red-400">{analysis.summary.priceDecreases}</span>
                        </div>
                        <p className="text-xs text-red-300">Price Decreases</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="h-5 w-5 text-green-400" />
                          <span className="text-2xl font-light text-green-400">
                            £{(analysis.summary.totalRevenuePotential / 1000).toFixed(1)}k
                          </span>
                        </div>
                        <p className="text-xs text-green-300 font-medium">Revenue Potential</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Section */}
                  <div className="px-6 py-4 bg-black/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/60 font-medium">Recommendation Breakdown</span>
                      <span className="text-xs text-white/60">
                        {analysis.summary.priceIncreases + analysis.summary.priceDecreases} of {analysis.summary.totalSKUs} SKUs ({((analysis.summary.priceIncreases + analysis.summary.priceDecreases) / analysis.summary.totalSKUs * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                        style={{ width: `${increasePercent}%` }}
                        title={`${analysis.summary.priceIncreases} increases (${increasePercent.toFixed(1)}%)`}
                      />
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                        style={{ width: `${decreasePercent}%` }}
                        title={`${analysis.summary.priceDecreases} decreases (${decreasePercent.toFixed(1)}%)`}
                      />
                      <div
                        className="bg-white/20 transition-all duration-500"
                        style={{ width: `${noChangePercent}%` }}
                        title={`${analysis.summary.totalSKUs - analysis.summary.priceIncreases - analysis.summary.priceDecreases} no change (${noChangePercent.toFixed(1)}%)`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-green-400">{increasePercent.toFixed(0)}% ↑</span>
                      <span className="text-red-400">{decreasePercent.toFixed(0)}% ↓</span>
                      <span className="text-white/60">{noChangePercent.toFixed(0)}% →</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 bg-black/10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {analysis.alertCount && analysis.alertCount > 0 && (
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-red-300 font-medium">{analysis.alertCount} alert{analysis.alertCount > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard?analysis=${analysis.uploadId}`)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => downloadAnalysisReport(analysis)}
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/15 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAnalysis(analysis._id)}
                        disabled={deleting === analysis._id}
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
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
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}