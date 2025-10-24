'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { useUser } from '@/contexts/UserContext'
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Database,
  Sparkles,
  Target,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompetitorPrice {
  sku: string
  competitor: string
  competitor_price: number
  our_price: number
  price_difference: number
  price_difference_percentage: number
  availability: boolean
  last_updated: Date
  source: string
  url?: string
  promotional?: boolean
  promotion_details?: string
  product_name?: string
  relevance_score?: number
  match_confidence?: number
  data_anomaly_flags?: any
}

interface PriceComparisonResult {
  sku: string
  our_price: number
  competitor_prices: CompetitorPrice[]
  market_position: {
    rank: number
    percentile: number
    price_advantage: number
  }
  recommendations: {
    action: 'maintain' | 'increase' | 'decrease' | 'investigate'
    target_price?: number
    reasoning: string
    urgency: 'low' | 'medium' | 'high'
  }
}

export default function CompetitivePage() {
  const { user } = useUser()
  const [competitorData, setCompetitorData] = useState<PriceComparisonResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchingProduct, setSearchingProduct] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [autoScanning, setAutoScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<any>(null)

  // Auto-fetch data when user is available
  useEffect(() => {
    if (user?.email) {
      fetchCompetitiveData()
    }
  }, [user])

  const fetchCompetitiveData = async () => {
    if (!user?.email) return

    setLoading(true)
    try {
      const response = await fetch(`/api/competitors/pricing?userId=${user.email}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Competitive data received:', data)
        if (data.success) {
          setCompetitorData(data.comparisons || [])
          setSummary(data.summary)
        }
      }
    } catch (error) {
      console.error('Failed to fetch competitive data:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchProduct = async () => {
    if (!searchTerm.trim() || !user?.email) return

    setSearchingProduct(searchTerm)
    try {
      const queryParams = new URLSearchParams({
        product: searchTerm,
        category: 'alcohol',
        maxRetailers: '10',
        userEmail: user.email,
        userId: user.email
      })

      const response = await fetch(`/api/competitors/live?${queryParams.toString()}`)
      const data = await response.json()

      if (data.success && data.competitors && data.competitors.length > 0) {
        // Add the new result to the top of the list
        const newResult: PriceComparisonResult = {
          sku: `SEARCH-${searchTerm.replace(/\s+/g, '-').toUpperCase()}`,
          our_price: data.our_price || 0,
          competitor_prices: data.competitors.map((comp: any) => ({
            sku: `SEARCH-${searchTerm.replace(/\s+/g, '-').toUpperCase()}`,
            competitor: comp.retailer,
            competitor_price: comp.price,
            our_price: data.our_price || 0,
            price_difference: data.our_price > 0 ? (comp.price - data.our_price) : 0,
            price_difference_percentage: data.our_price > 0 ?
              (((comp.price - data.our_price) / data.our_price) * 100) : 0,
            availability: comp.availability !== false,
            last_updated: new Date(),
            source: comp.retailer.toLowerCase().replace(/\s+/g, '_'),
            url: comp.url,
            product_name: comp.product_name,
            relevance_score: comp.relevance_score || 0.8,
            match_confidence: comp.match_confidence
          })),
          market_position: {
            rank: 1,
            percentile: 50,
            price_advantage: 0
          },
          recommendations: {
            action: 'investigate',
            reasoning: data.database_saved ?
              'Live competitive intelligence - data saved' :
              'Real-time market analysis',
            urgency: 'low'
          }
        }

        setCompetitorData([newResult, ...competitorData])
        // Don't auto-refresh - keeps search results visible
        // User can manually refresh if needed
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearchingProduct('')
    }
  }

  const startAutoScan = async () => {
    if (!user?.email || autoScanning) return

    setAutoScanning(true)
    try {
      const response = await fetch('/api/competitors/auto-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          maxProducts: 20, // Scan top 20 products
          background: true
        })
      })

      const data = await response.json()

      if (data.success) {
        setScanProgress({
          queued: data.products_queued,
          estimatedTime: data.estimated_time_minutes
        })

        // Poll for updates every 5 seconds
        const pollInterval = setInterval(async () => {
          await fetchCompetitiveData()
        }, 5000)

        // Stop polling after estimated time + buffer
        setTimeout(() => {
          clearInterval(pollInterval)
          setAutoScanning(false)
          setScanProgress(null)
          fetchCompetitiveData()
        }, (data.estimated_time_minutes * 60 * 1000) + 30000)
      } else {
        // Handle error
        setAutoScanning(false)
        alert(data.error || 'Failed to start scan')
      }
    } catch (error) {
      console.error('Auto-scan failed:', error)
      setAutoScanning(false)
      setScanProgress(null)
      alert('Failed to start scan - please try again')
    }
  }

  const filteredData = competitorData.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.competitor_prices.some(cp =>
      cp.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar onLogin={() => {}} onSignup={() => {}} />

      <div className="pt-24 px-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">
              Competitive Intelligence
            </h1>
          </div>
          <p className="text-white/60">
            Real-time competitive pricing powered by AI
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchProduct()}
              placeholder="Search for a product (e.g., Absolut Cherry)..."
              className="w-full pl-12 pr-32 py-4 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
            />
            <button
              onClick={searchProduct}
              disabled={!searchTerm.trim() || !!searchingProduct}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-white text-black rounded font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {searchingProduct ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Search Live</span>
                </>
              )}
            </button>
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-white/40">
              Press Enter or click Search Live to fetch real-time competitor prices
            </p>
          )}
        </div>

        {/* Auto-Scan Button */}
        <div className="mb-8 flex items-center justify-between bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Automated Inventory Scan</h3>
            <p className="text-white/60 text-sm">
              Automatically scan your top {scanProgress?.queued || 20} products for competitive pricing
            </p>
          </div>
          <button
            onClick={startAutoScan}
            disabled={autoScanning}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {autoScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                <span>Scan All Inventory</span>
              </>
            )}
          </button>
        </div>

        {/* Scan Progress Indicator */}
        {scanProgress && autoScanning && (
          <div className="mb-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">
                  Background Scan in Progress
                </h3>
                <p className="text-white/80 mb-3">
                  Scanning {scanProgress.queued} products for competitive prices across major UK retailers...
                </p>
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-400 h-full transition-all duration-1000 ease-linear"
                    style={{
                      width: '100%',
                      animation: 'progress-slide 30s linear infinite'
                    }}
                  />
                </div>
                <p className="text-white/60 text-sm mt-2">
                  Estimated time: ~{scanProgress.estimatedTime} minutes. Results will appear automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{summary.total_inventory_skus}</span>
              </div>
              <p className="text-white/60 text-sm">Total SKUs</p>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">{summary.total_comparisons}</span>
              </div>
              <p className="text-white/60 text-sm">Price Comparisons</p>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{summary.competitive_coverage}%</span>
              </div>
              <p className="text-white/60 text-sm">Coverage</p>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {summary.revenue_opportunities?.urgent_actions_needed || 0}
                </span>
              </div>
              <p className="text-white/60 text-sm">Actions Needed</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-white/60">Loading competitive intelligence...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/20 rounded-lg">
            <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {competitorData.length === 0 ? 'No Competitive Data Yet' : 'No Results Found'}
            </h3>
            <p className="text-white/60 mb-6">
              {competitorData.length === 0 && summary?.total_inventory_skus > 0
                ? `You have ${summary.total_inventory_skus} products in inventory. Start an automated scan to get competitive prices.`
                : competitorData.length === 0
                ? 'Search for a product above to get started with real-time competitive intelligence'
                : 'Try a different search term'
              }
            </p>

            {scanProgress && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-3 mb-2">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <p className="text-blue-300 font-medium">Scanning {scanProgress.queued} products...</p>
                </div>
                <p className="text-blue-200 text-sm">
                  Estimated time: ~{scanProgress.estimatedTime} minutes
                </p>
                <p className="text-white/60 text-xs mt-2">
                  Data will appear automatically as products are scanned
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {summary?.total_inventory_skus > 0 && !autoScanning && (
                <button
                  onClick={startAutoScan}
                  disabled={autoScanning}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan All Inventory</span>
                </button>
              )}
              <button
                onClick={fetchCompetitiveData}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((comparison, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/20 rounded-lg overflow-hidden hover:border-white/30 transition-colors"
              >
                {/* Product Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{comparison.sku}</h3>
                      {comparison.competitor_prices[0]?.product_name && (
                        <p className="text-white/60 text-sm">{comparison.competitor_prices[0].product_name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60 mb-1">Our Price</p>
                      <p className="text-2xl font-bold text-white">
                        £{comparison.our_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Competitor Prices */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wide">
                    Competitor Prices ({comparison.competitor_prices.length})
                  </h4>
                  <div className="space-y-3">
                    {comparison.competitor_prices.map((comp, compIdx) => {
                      const priceDiff = comp.price_difference_percentage
                      const isLower = priceDiff < 0
                      const isHigher = priceDiff > 0

                      return (
                        <div
                          key={compIdx}
                          className="flex items-center justify-between p-4 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1">
                              <p className="font-medium text-white">{comp.competitor}</p>
                              {comp.match_confidence && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all",
                                        comp.match_confidence > 0.8 ? "bg-green-400" :
                                        comp.match_confidence > 0.6 ? "bg-yellow-400" : "bg-red-400"
                                      )}
                                      style={{ width: `${comp.match_confidence * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-white/40">
                                    {(comp.match_confidence * 100).toFixed(0)}% match
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-xl font-bold text-white">
                                £{comp.competitor_price.toFixed(2)}
                              </p>
                              <div className="flex items-center gap-2 justify-end mt-1">
                                {isLower ? (
                                  <>
                                    <TrendingDown className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-green-400">
                                      {Math.abs(priceDiff).toFixed(1)}% lower
                                    </span>
                                  </>
                                ) : isHigher ? (
                                  <>
                                    <TrendingUp className="w-4 h-4 text-red-400" />
                                    <span className="text-sm font-medium text-red-400">
                                      {priceDiff.toFixed(1)}% higher
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Minus className="w-4 h-4 text-white/40" />
                                    <span className="text-sm text-white/40">Same price</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {comp.url && (
                              <a
                                href={comp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/10 rounded transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 text-white/60" />
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                {comparison.recommendations && (
                  <div className="p-6 border-t border-white/10">
                    <div className="flex items-start gap-3">
                      <AlertCircle className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        comparison.recommendations.urgency === 'high' ? 'text-red-400' :
                        comparison.recommendations.urgency === 'medium' ? 'text-yellow-400' : 'text-white/60'
                      )} />
                      <div>
                        <p className="text-sm font-medium text-white mb-1">Recommendation</p>
                        <p className="text-white/60 text-sm">{comparison.recommendations.reasoning}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
