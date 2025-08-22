'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  AlertTriangle,
  FileText,
  Clock,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Eye,
  Filter,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/UserContext'

interface HistoryData {
  stats: {
    totalAnalyses: number
    totalSKUs: number
    totalRevenuePotential: number
    avgSKUsPerAnalysis: number
    recentAnalyses: number
  }
  recentAnalyses: Array<{
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
  }>
  trends: {
    skuGrowth: number
    revenueGrowth: number
    riskChange: number
    optimizationRate: number
  } | null
  hasHistory: boolean
}

interface HistoryDashboardProps {
  onSelectAnalysis?: (analysisId: string) => void
}

export function HistoryDashboard({ onSelectAnalysis }: HistoryDashboardProps) {
  const { user } = useUser()
  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7d' | '30d' | '90d'>('all')

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  const fetchHistory = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching history for user:', user.email)
      
      const response = await fetch(`/api/history?userId=${user.email}&userEmail=${user.email}&limit=50`)
      const data = await response.json()
      
      console.log('History API response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch history')
      }
      
      setHistoryData(data)
    } catch (err) {
      console.error('History fetch error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Early return if no user
  if (!user) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading user context...</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return formatDate(dateString)
  }

  const TrendIndicator = ({ value, label, type = 'number' }: { 
    value: number, 
    label: string, 
    type?: 'number' | 'currency' | 'percentage' 
  }) => {
    const isPositive = value > 0
    const isNeutral = value === 0
    
    const formatValue = () => {
      if (type === 'currency') return `$${Math.abs(value).toLocaleString()}`
      if (type === 'percentage') return `${Math.abs(value)}%`
      return Math.abs(value).toLocaleString()
    }

    return (
      <div className={cn(
        "flex items-center space-x-1 text-sm font-medium",
        isNeutral ? "text-gray-500" : isPositive ? "text-green-600" : "text-red-600"
      )}>
        {isNeutral ? (
          <Minus className="h-4 w-4" />
        ) : isPositive ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
        <span>{formatValue()} {label}</span>
      </div>
    )
  }

  const filterAnalysesByPeriod = (analyses: any[]) => {
    if (filterPeriod === 'all') return analyses
    
    const now = new Date()
    const cutoffDays = filterPeriod === '7d' ? 7 : filterPeriod === '30d' ? 30 : 90
    const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000)
    
    return analyses.filter(analysis => new Date(analysis.processedAt) >= cutoffDate)
  }

  const filterAnalysesBySearch = (analyses: any[]) => {
    if (!searchTerm) return analyses
    
    return analyses.filter(analysis => 
      analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.uploadId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading your analysis history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-900">Error Loading History</h3>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <button 
          onClick={fetchHistory}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!historyData?.hasHistory) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis History Yet</h3>
        <p className="text-gray-600 mb-6">
          Upload your first CSV file to start tracking your inventory optimization progress!
        </p>
        <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
          <h4 className="font-medium text-blue-900 mb-2">Get Started:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Go to Analytics page</li>
            <li>2. Upload your inventory CSV</li>
            <li>3. Get AI recommendations</li>
            <li>4. Track progress here</li>
          </ol>
        </div>
      </div>
    )
  }

  const filteredAnalyses = filterAnalysesBySearch(filterAnalysesByPeriod(historyData.recentAnalyses))

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{historyData.stats.totalAnalyses}</div>
          <div className="text-sm text-gray-600">Total Analyses</div>
          {historyData.trends && (
            <TrendIndicator 
              value={historyData.trends.skuGrowth} 
              label="vs last time" 
            />
          )}
        </div>
        
        <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{historyData.stats.totalSKUs}</div>
          <div className="text-sm text-gray-600">SKUs Tracked</div>
          <div className="text-xs text-gray-500 mt-1">
            Avg: {Math.round(historyData.stats.avgSKUsPerAnalysis)} per analysis
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${Math.round(historyData.stats.totalRevenuePotential).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Revenue Potential</div>
          {historyData.trends && (
            <TrendIndicator 
              value={historyData.trends.revenueGrowth} 
              label="vs last time"
              type="currency"
            />
          )}
        </div>
        
        <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {historyData.trends?.optimizationRate || 0}
          </div>
          <div className="text-sm text-gray-600">Optimizations</div>
          <div className="text-xs text-gray-500 mt-1">Latest analysis</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Analysis History</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Time Filter */}
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            {/* Refresh Button */}
            <button 
              onClick={fetchHistory}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Analysis List */}
        <div className="space-y-4">
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchTerm || filterPeriod !== 'all' 
                  ? 'No analyses match your filters' 
                  : 'No analyses found'
                }
              </p>
              {(searchTerm || filterPeriod !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterPeriod('all')
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredAnalyses.map((analysis, index) => (
              <div 
                key={analysis._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => onSelectAnalysis?.(analysis.uploadId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold",
                      index === 0 ? "bg-blue-600" : index === 1 ? "bg-green-600" : "bg-gray-400"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {analysis.fileName}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{formatDate(analysis.processedAt)}</span>
                        <span>•</span>
                        <span>{getRelativeTime(analysis.processedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {index === 0 && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Latest
                      </span>
                    )}
                    <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
                
                {/* Analysis Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-600">{analysis.summary.totalSKUs}</div>
                    <div className="text-xs text-gray-600">SKUs</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-600">
                      {analysis.summary.priceIncreases + analysis.summary.priceDecreases}
                    </div>
                    <div className="text-xs text-gray-600">Changes</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="font-semibold text-red-600">{analysis.summary.highRiskSKUs}</div>
                    <div className="text-xs text-gray-600">High Risk</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-600">
                      ${Math.round(Math.abs(analysis.summary.totalRevenuePotential)).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-600">
                      {Math.round(((analysis.summary.priceIncreases + analysis.summary.priceDecreases) / analysis.summary.totalSKUs) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Optimization Rate</div>
                  </div>
                </div>
                
                {/* Quick Insights */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {analysis.summary.priceIncreases > 0 && (
                      <span className="flex items-center space-x-1">
                        <ArrowUp className="h-3 w-3 text-green-600" />
                        <span>{analysis.summary.priceIncreases} increases</span>
                      </span>
                    )}
                    {analysis.summary.priceDecreases > 0 && (
                      <span className="flex items-center space-x-1">
                        <ArrowDown className="h-3 w-3 text-red-600" />
                        <span>{analysis.summary.priceDecreases} decreases</span>
                      </span>
                    )}
                  </div>
                  <span>Click to view details</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Insights */}
      {historyData.trends && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Revenue Optimization</span>
                <TrendIndicator 
                  value={historyData.trends.revenueGrowth} 
                  label=""
                  type="currency"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Risk Management</span>
                <TrendIndicator 
                  value={-historyData.trends.riskChange} 
                  label="risk SKUs"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">SKU Coverage</span>
                <TrendIndicator 
                  value={historyData.trends.skuGrowth} 
                  label="SKUs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Optimization Rate</span>
                <span className="text-blue-600 font-medium">
                  {historyData.recentAnalyses[0] ? Math.round((historyData.trends.optimizationRate / historyData.recentAnalyses[0].summary.totalSKUs) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Insights */}
          <div className="mt-6 p-4 bg-white bg-opacity-60 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Key Takeaways</h4>
            <div className="text-sm text-gray-700 space-y-1">
              {historyData.trends.revenueGrowth > 0 && (
                <p>• Revenue optimization trending upward - good momentum!</p>
              )}
              {historyData.trends.riskChange < 0 && (
                <p>• Risk management improving - fewer high-risk SKUs</p>
              )}
              {historyData.trends.skuGrowth > 0 && (
                <p>• Expanding SKU coverage - analyzing more products</p>
              )}
              {historyData.stats.totalAnalyses >= 5 && (
                <p>• Regular analysis pattern established - great consistency!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}