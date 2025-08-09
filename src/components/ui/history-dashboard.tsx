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
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/history')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch history')
      }
      
      setHistoryData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
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

  const TrendIndicator = ({ value, label, type = 'number' }: { 
    value: number, 
    label: string, 
    type?: 'number' | 'currency' | 'percentage' 
  }) => {
    const isPositive = value > 0
    const isNeutral = value === 0
    
    const formatValue = () => {
      if (type === 'currency') return `$${Math.abs(value)}`
      if (type === 'percentage') return `${Math.abs(value)}%`
      return Math.abs(value).toString()
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
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchHistory}
          className="mt-3 text-red-600 hover:text-red-800 text-sm underline"
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
      </div>
    )
  }

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
            Avg: {historyData.stats.avgSKUsPerAnalysis} per analysis
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${Math.round(historyData.stats.totalRevenuePotential)}
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
          <div className="text-xs text-gray-500 mt-1">This analysis</div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Recent Analyses</h3>
          </div>
          <button 
            onClick={fetchHistory}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          {historyData.recentAnalyses.map((analysis, index) => (
            <div 
              key={analysis._id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => onSelectAnalysis?.(analysis._id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold",
                    index === 0 ? "bg-blue-600" : "bg-gray-400"
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{analysis.fileName}</h4>
                    <p className="text-sm text-gray-600">{formatDate(analysis.processedAt)}</p>
                  </div>
                </div>
                {index === 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Latest
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">SKUs:</span>
                  <span className="font-medium text-gray-900 ml-1">{analysis.summary.totalSKUs}</span>
                </div>
                <div>
                  <span className="text-gray-500">Price Changes:</span>
                  <span className="font-medium text-gray-900 ml-1">
                    {analysis.summary.priceIncreases + analysis.summary.priceDecreases}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">High Risk:</span>
                  <span className="font-medium text-red-600 ml-1">{analysis.summary.highRiskSKUs}</span>
                </div>
                <div>
                  <span className="text-gray-500">Revenue:</span>
                  <span className="font-medium text-green-600 ml-1">
                    ${Math.round(analysis.summary.totalRevenuePotential)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {historyData.recentAnalyses.length >= 10 && (
          <div className="text-center mt-6">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All Analyses
            </button>
          </div>
        )}
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
                  {Math.round((historyData.trends.optimizationRate / historyData.recentAnalyses[0]?.summary.totalSKUs) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}