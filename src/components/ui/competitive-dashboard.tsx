// NEW FILE: /src/components/ui/competitive-dashboard.tsx
// Competitive Intelligence Dashboard for Alcohol Brands

'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Search,
  RefreshCw,
  Target,
  BarChart3,
  Eye,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Filter
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

interface MarketTrend {
  category: string
  average_price_change: number
  price_volatility: number
  trending_up: string[]
  trending_down: string[]
}

export function CompetitiveDashboard() {
  const [competitorData, setCompetitorData] = useState<PriceComparisonResult[]>([])
  const [marketTrends, setMarketTrends] = useState<MarketTrend | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchCompetitiveData()
    fetchMarketTrends()
  }, [])

  const fetchCompetitiveData = async () => {
    setLoading(true)
    try {
      // Mock data - in production, would call actual API
      const mockData: PriceComparisonResult[] = [
        {
          sku: 'WHISKEY-001',
          our_price: 45.99,
          competitor_prices: [
            {
              sku: 'WHISKEY-001',
              competitor: 'Total Wine & More',
              competitor_price: 42.99,
              our_price: 45.99,
              price_difference: -3.00,
              price_difference_percentage: -6.5,
              availability: true,
              last_updated: new Date(),
              source: 'total_wine',
              url: 'https://totalwine.com/product/whiskey-001'
            },
            {
              sku: 'WHISKEY-001',
              competitor: 'Wine.com',
              competitor_price: 47.95,
              our_price: 45.99,
              price_difference: 1.96,
              price_difference_percentage: 4.3,
              availability: true,
              last_updated: new Date(),
              source: 'wine_com'
            }
          ],
          market_position: {
            rank: 2,
            percentile: 67,
            price_advantage: -2.1
          },
          recommendations: {
            action: 'maintain',
            reasoning: 'Well positioned vs competitors',
            urgency: 'low'
          }
        },
        {
          sku: 'CRAFT-BEER-001',
          our_price: 18.99,
          competitor_prices: [
            {
              sku: 'CRAFT-BEER-001',
              competitor: 'BevMo!',
              competitor_price: 16.99,
              our_price: 18.99,
              price_difference: -2.00,
              price_difference_percentage: -10.5,
              availability: true,
              last_updated: new Date(),
              source: 'bevmo',
              promotional: true,
              promotion_details: '15% off craft beer'
            }
          ],
          market_position: {
            rank: 3,
            percentile: 25,
            price_advantage: 8.9
          },
          recommendations: {
            action: 'decrease',
            target_price: 17.49,
            reasoning: 'Overpriced vs competition',
            urgency: 'medium'
          }
        }
      ]
      
      setCompetitorData(mockData)
    } catch (error) {
      console.error('Failed to fetch competitive data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMarketTrends = async () => {
    try {
      const mockTrends: MarketTrend = {
        category: 'spirits',
        average_price_change: 2.3,
        price_volatility: 8.2,
        trending_up: ['PREMIUM-VODKA-001', 'CRAFT-WHISKEY-002'],
        trending_down: ['LIGHT-BEER-001', 'MASS-WINE-001']
      }
      
      setMarketTrends(mockTrends)
    } catch (error) {
      console.error('Failed to fetch market trends:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchCompetitiveData(), fetchMarketTrends()])
    setRefreshing(false)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'increase':
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'decrease':
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'maintain':
        return <Minus className="h-4 w-4 text-blue-600" />
      default:
        return <Eye className="h-4 w-4 text-orange-600" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const filteredData = competitorData.filter(item => 
    searchTerm === '' || item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const overviewStats = {
    totalProducts: competitorData.length,
    needPriceDecrease: competitorData.filter(item => item.recommendations.action === 'decrease').length,
    needPriceIncrease: competitorData.filter(item => item.recommendations.action === 'increase').length,
    highUrgency: competitorData.filter(item => item.recommendations.urgency === 'high').length,
    avgPriceAdvantage: competitorData.reduce((sum, item) => sum + item.market_position.price_advantage, 0) / competitorData.length || 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitive Intelligence</h1>
          <p className="text-gray-600">Monitor competitor pricing and market trends</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            <span>Refresh Data</span>
          </button>
          
          <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'detailed', label: 'Detailed', icon: Target },
              { key: 'trends', label: 'Trends', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products Monitored</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Price Decreases Needed</p>
              <p className="text-2xl font-bold text-red-600">{overviewStats.needPriceDecrease}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Price Increases Possible</p>
              <p className="text-2xl font-bold text-green-600">{overviewStats.needPriceIncrease}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">{overviewStats.highUrgency}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Price Advantage</p>
              <p className={cn(
                "text-2xl font-bold",
                overviewStats.avgPriceAdvantage > 0 ? "text-red-600" : "text-green-600"
              )}>
                {overviewStats.avgPriceAdvantage > 0 ? '+' : ''}{overviewStats.avgPriceAdvantage.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Market Trends Section */}
      {marketTrends && viewMode === 'trends' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Trends - {marketTrends.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {marketTrends.average_price_change > 0 ? '+' : ''}{marketTrends.average_price_change}%
              </div>
              <div className="text-sm text-gray-600">Average Price Change</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{marketTrends.price_volatility}%</div>
              <div className="text-sm text-gray-600">Price Volatility</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{marketTrends.trending_up.length}</div>
              <div className="text-sm text-gray-600">Products Trending Up</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="beer">Beer</option>
          <option value="wine">Wine</option>
          <option value="spirits">Spirits</option>
          <option value="rtd">Ready-to-Drink</option>
        </select>
      </div>

      {/* Competitive Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Price Comparison Results</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Our Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Competitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recommendation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.sku} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.sku}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      ${item.our_price.toFixed(2)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        Rank #{item.market_position.rank}
                      </div>
                      <div className={cn(
                        "text-sm font-medium",
                        item.market_position.price_advantage > 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {item.market_position.price_advantage > 0 ? '+' : ''}{item.market_position.price_advantage.toFixed(1)}% vs avg
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {item.competitor_prices.slice(0, 2).map((comp, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{comp.competitor}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">${comp.competitor_price.toFixed(2)}</span>
                            {comp.promotional && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                PROMO
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {item.competitor_prices.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{item.competitor_prices.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(item.recommendations.action)}
                        <span className="font-medium capitalize">
                          {item.recommendations.action}
                        </span>
                      </div>
                      <div className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded-full border",
                        getUrgencyColor(item.recommendations.urgency)
                      )}>
                        {item.recommendations.urgency} urgency
                      </div>
                      {item.recommendations.target_price && (
                        <div className="text-sm text-gray-600">
                          Target: ${item.recommendations.target_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Competitive Intelligence Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Market Position:</strong> You're competitively positioned in {Math.round((competitorData.filter(item => item.recommendations.action === 'maintain').length / competitorData.length) * 100)}% of monitored products.
          </div>
          <div>
            <strong>Pricing Opportunities:</strong> {overviewStats.needPriceIncrease} products can support price increases for additional revenue.
          </div>
          <div>
            <strong>Competitive Threats:</strong> {overviewStats.needPriceDecrease} products need price adjustments to maintain competitiveness.
          </div>
        </div>
      </div>
    </div>
  )
}