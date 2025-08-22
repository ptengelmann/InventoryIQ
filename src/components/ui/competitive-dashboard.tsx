'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  Search,
  RefreshCw,
  Target,
  BarChart3,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Plus,
  Wine,
  CheckCircle,
  Brain,
  Shield,
  Globe,
  Zap
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

export function CompetitiveDashboard() {
  const router = useRouter()
  const { user } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [competitorData, setCompetitorData] = useState<PriceComparisonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [testProduct, setTestProduct] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    fetchCompetitiveData()
  }, [])

  const handleLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleSignup = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = (userData: any) => {
    setAuthModalOpen(false)
    router.push('/dashboard')
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  const fetchCompetitiveData = async () => {
    setLoading(true)
    try {
      const mockData: PriceComparisonResult[] = [
        {
          sku: 'DEMO-WHISKEY-001',
          our_price: 45.99,
          competitor_prices: [
            {
              sku: 'DEMO-WHISKEY-001',
              competitor: 'Majestic Wine',
              competitor_price: 42.99,
              our_price: 45.99,
              price_difference: -3.00,
              price_difference_percentage: -6.5,
              availability: true,
              last_updated: new Date(),
              source: 'majestic',
              url: 'https://majestic.co.uk/search?q=whiskey'
            },
            {
              sku: 'DEMO-WHISKEY-001',
              competitor: 'Waitrose',
              competitor_price: 47.95,
              our_price: 45.99,
              price_difference: 1.96,
              price_difference_percentage: 4.3,
              availability: true,
              last_updated: new Date(),
              source: 'waitrose'
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
        }
      ]
      
      setCompetitorData(mockData)
    } catch (error) {
      console.error('Failed to fetch competitive data:', error)
    } finally {
      setLoading(false)
    }
  }

  const testLiveCompetitorData = async () => {
    if (!testProduct) return
    
    setRefreshing(true)
    try {
      const response = await fetch(`/api/competitors/live?product=${encodeURIComponent(testProduct)}&category=spirits`)
      const data = await response.json()
      
      if (data.success && data.competitors) {
        const newCompetitorData: PriceComparisonResult = {
          sku: `LIVE-${testProduct.replace(/\s+/g, '-').toUpperCase()}`,
          our_price: 0,
          competitor_prices: data.competitors.map((comp: any) => ({
            sku: `LIVE-${testProduct.replace(/\s+/g, '-').toUpperCase()}`,
            competitor: comp.retailer,
            competitor_price: comp.price,
            our_price: 0,
            price_difference: 0,
            price_difference_percentage: 0,
            availability: comp.availability,
            last_updated: new Date(),
            source: comp.retailer.toLowerCase().replace(/\s+/g, '_') as any,
            url: comp.url,
            product_name: comp.product_name,
            relevance_score: comp.relevance_score
          })),
          market_position: {
            rank: 1,
            percentile: 50,
            price_advantage: 0
          },
          recommendations: {
            action: 'investigate',
            reasoning: 'Live competitive data - set your price to see recommendations',
            urgency: 'medium'
          }
        }
        
        setCompetitorData(prev => [newCompetitorData, ...prev])
        setTestProduct('')
        
        alert(`Found ${data.competitors.length} competitor prices for ${testProduct}`)
      } else {
        alert('No competitive data found.')
      }
      
    } catch (error) {
      console.error('Live test failed:', error)
      alert('Failed to fetch live data.')
    } finally {
      setRefreshing(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchCompetitiveData()
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            left: '10%',
            top: '20%'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
            right: '10%',
            top: '60%'
          }}
        />
      </div>

      {/* Header */}
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header with Landing Page Styling */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-purple-100 px-4 py-2 rounded-full border border-amber-200">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">UK Alcohol Competitive Intelligence</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
              Monitor
              <span className="block bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Competitor Pricing
              </span>
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Real UK retailer data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Rate-limited & compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-500" />
                <span>4+ major UK retailers</span>
              </div>
            </div>
          </div>

          {/* Live Test Section with Landing Page Design */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Test Live Competitive Data</h3>
                <p className="text-gray-600">Get real-time pricing from UK alcohol retailers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                placeholder="Enter product name (e.g., 'Hendricks Gin', 'Macallan 12')"
                value={testProduct}
                onChange={(e) => setTestProduct(e.target.value)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                onKeyPress={(e) => e.key === 'Enter' && testLiveCompetitorData()}
              />
              <button
                onClick={testLiveCompetitorData}
                disabled={!testProduct || refreshing}
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                <span>Get Live Prices</span>
                {refreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Wine className="h-4 w-4 text-green-600" />
                <span className="text-gray-700">Real UK retailer pricing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700">AI-powered recommendations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-gray-700">Market positioning insights</span>
              </div>
            </div>
          </div>

          {/* Overview Stats with Landing Page Design */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { label: 'Products Monitored', value: overviewStats.totalProducts, icon: Target, color: 'from-blue-500 to-purple-500' },
              { label: 'Price Decreases Needed', value: overviewStats.needPriceDecrease, icon: ArrowDown, color: 'from-red-500 to-pink-500' },
              { label: 'Price Increases Possible', value: overviewStats.needPriceIncrease, icon: ArrowUp, color: 'from-green-500 to-emerald-500' },
              { label: 'High Priority', value: overviewStats.highUrgency, icon: AlertTriangle, color: 'from-orange-500 to-red-500' },
              { label: 'Price Advantage', value: `${overviewStats.avgPriceAdvantage > 0 ? '+' : ''}${overviewStats.avgPriceAdvantage.toFixed(1)}%`, icon: DollarSign, color: 'from-purple-500 to-pink-500' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      index === 1 ? "text-red-600" : 
                      index === 2 ? "text-green-600" :
                      index === 3 ? "text-orange-600" :
                      index === 4 && overviewStats.avgPriceAdvantage > 0 ? "text-red-600" :
                      index === 4 && overviewStats.avgPriceAdvantage <= 0 ? "text-green-600" :
                      "text-gray-900"
                    )}>{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="all">All Categories</option>
              <option value="beer">Beer</option>
              <option value="wine">Wine</option>
              <option value="spirits">Spirits</option>
              <option value="rtd">Ready-to-Drink</option>
            </select>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Competitive Data Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-purple-50 px-8 py-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Competitive Price Analysis</h3>
              <p className="text-gray-600 mt-1">Real-time pricing intelligence from UK alcohol retailers</p>
            </div>
            
            {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Competitive Data Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Use the "Test Live Competitive Data" section above to fetch real competitor prices from UK alcohol retailers.
                </p>
                <button
                  onClick={() => setTestProduct('Hendricks Gin')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  <span>Try Demo with Hendricks Gin</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Our Price</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Competitors</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Recommendation</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.sku} className="hover:bg-amber-50 transition-colors">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="font-bold text-gray-900 text-lg">{item.sku}</div>
                          {item.sku.startsWith('DEMO-') && (
                            <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full mt-2 inline-block font-medium">Demo Data</span>
                          )}
                          {item.sku.startsWith('LIVE-') && (
                            <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full mt-2 inline-block font-medium">Live Data</span>
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-2xl font-bold text-gray-900">£{item.our_price.toFixed(2)}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-3">
                            {item.competitor_prices.slice(0, 2).map((comp, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                                <span className="text-gray-700 font-medium">{comp.competitor}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-lg">£{comp.competitor_price.toFixed(2)}</span>
                                  {comp.promotional && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">PROMO</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {item.competitor_prices.length > 2 && (
                              <div className="text-xs text-gray-500 text-center">+{item.competitor_prices.length - 2} more retailers</div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              {getActionIcon(item.recommendations.action)}
                              <span className="font-bold capitalize text-lg">{item.recommendations.action}</span>
                            </div>
                            <div className={cn("inline-flex px-3 py-1 text-xs font-bold rounded-full border-2", getUrgencyColor(item.recommendations.urgency))}>
                              {item.recommendations.urgency} urgency
                            </div>
                            {item.recommendations.target_price && (
                              <div className="text-sm text-gray-600 font-medium">Target: £{item.recommendations.target_price.toFixed(2)}</div>
                            )}
                            <p className="text-sm text-gray-600 italic">{item.recommendations.reasoning}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">View Details</button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}