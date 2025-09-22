// src/app/competitive/page.tsx - PROFESSIONAL BLACK/WHITE VERSION
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
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  CheckCircle,
  Brain,
  Shield,
  Globe,
  Package,
  Activity,
  Database
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
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [competitorData, setCompetitorData] = useState<PriceComparisonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [testProduct, setTestProduct] = useState('')

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
    const fullUserData = {
      ...userData,
      company: 'Demo Account',
      phone: '',
      location: 'UK'
    }
    login(fullUserData)
    setAuthModalOpen(false)
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  const fetchCompetitiveData = async () => {
    setLoading(true)
    try {
      if (user) {
        const response = await fetch(`/api/competitors/pricing?userId=${user.email}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.comparisons) {
            setCompetitorData(data.comparisons)
            setLoading(false)
            return
          }
        }
      }
      
      // Professional demo data
      const mockData: PriceComparisonResult[] = []
      setCompetitorData(mockData)
    } catch (error) {
      console.error('Failed to fetch competitive data:', error)
      setCompetitorData([])
    } finally {
      setLoading(false)
    }
  }

  const testLiveCompetitorData = async () => {
    if (!testProduct) return
    
    setRefreshing(true)
    try {
      const queryParams = new URLSearchParams({
        product: testProduct,
        category: 'spirits',
        maxRetailers: '10' // Increased from 5 to 10
      })
      
      if (user) {
        queryParams.append('userEmail', user.email)
        queryParams.append('userId', user.email)
      }
      
      console.log('Testing live competitor data for:', testProduct)
      
      const response = await fetch(`/api/competitors/live?${queryParams.toString()}`)
      const data = await response.json()
      
      console.log('Live API Response:', data)
      
      if (data.success && data.competitors && data.competitors.length > 0) {
        const newResult: PriceComparisonResult = {
          sku: `LIVE-${testProduct.replace(/\s+/g, '-').toUpperCase()}`,
          our_price: data.our_price || 0,
          competitor_prices: data.competitors.map((comp: any) => ({
            sku: `LIVE-${testProduct.replace(/\s+/g, '-').toUpperCase()}`,
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
            relevance_score: comp.relevance_score || 0.8
          })),
          market_position: {
            rank: 1,
            percentile: 50,
            price_advantage: 0
          },
          recommendations: {
            action: 'investigate',
            reasoning: data.database_saved ? 
              'Competitive analysis complete - data saved to database' : 
              'Upload inventory CSV for complete price comparisons',
            urgency: 'low'
          }
        }
        
        // Calculate market position
        if (data.market_analysis && data.competitors.length > 0) {
          const avgPrice = data.market_analysis.price_range?.average || 0
          const minPrice = data.market_analysis.price_range?.min || 0
          const maxPrice = data.market_analysis.price_range?.max || 0
          
          if (avgPrice > 0) {
            const priceAdvantage = data.our_price > 0 ? ((data.our_price - avgPrice) / avgPrice) * 100 : 0
            
            newResult.market_position = {
              rank: 1, // Would need our_price to calculate real rank
              percentile: 50,
              price_advantage: Math.round(priceAdvantage * 100) / 100
            }
            
            // Generate better recommendations
            if (priceAdvantage > 15) {
              newResult.recommendations = {
                action: 'decrease',
                target_price: avgPrice * 1.05,
                reasoning: `Your price is ${priceAdvantage.toFixed(1)}% above market average (£${avgPrice.toFixed(2)})`,
                urgency: 'medium'
              }
            } else if (priceAdvantage < -15) {
              newResult.recommendations = {
                action: 'increase',
                target_price: avgPrice * 0.95,
                reasoning: `Your price is ${Math.abs(priceAdvantage).toFixed(1)}% below market - pricing opportunity`,
                urgency: 'low'
              }
            } else {
              newResult.recommendations = {
                action: 'investigate',
                reasoning: `Found ${data.competitors.length} competitor prices. Upload inventory for full analysis.`,
                urgency: 'low'
              }
            }
          }
        }
        
        // Add to existing data (remove old entry with same product if exists)
        setCompetitorData(prev => {
          const filtered = prev.filter(item => !item.sku.includes(testProduct.replace(/\s+/g, '-').toUpperCase()))
          return [newResult, ...filtered]
        })
        
        setTestProduct('')
        
      } else {
        console.log('No competitive data found for:', testProduct)
      }
      
    } catch (error) {
      console.error('Live test failed:', error)
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
        return <ArrowUp className="h-4 w-4 text-green-700" />
      case 'decrease':
        return <ArrowDown className="h-4 w-4 text-red-700" />
      case 'maintain':
        return <Minus className="h-4 w-4 text-gray-700" />
      default:
        return <Eye className="h-4 w-4 text-gray-700" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-gray-800 text-white border-gray-800'
      case 'medium':
        return 'bg-gray-600 text-white border-gray-600'
      default:
        return 'bg-gray-400 text-white border-gray-400'
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
    avgPriceAdvantage: competitorData.length > 0 ? 
      competitorData.reduce((sum, item) => sum + item.market_position.price_advantage, 0) / competitorData.length : 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading competitive intelligence...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg">
              <Target className="h-4 w-4" />
              <span className="text-sm font-medium">UK Alcohol Competitive Intelligence</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-black">
              Competitive Price Intelligence
            </h1>

            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Real-time competitive pricing from major UK alcohol retailers. 
              Monitor Majestic Wine, Waitrose, Tesco, ASDA, and more.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-black" />
                <span>Real UK retailer data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-black" />
                <span>SERP API powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-black" />
                <span>Database persistence</span>
              </div>
            </div>
          </div>

          {/* Live Test Section */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">Live Competitive Search</h3>
                <p className="text-gray-600">Get real-time pricing from UK alcohol retailers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <input
                type="text"
                placeholder="Enter product name (e.g., 'Grey Goose Vodka', 'Macallan 12 Whisky')"
                value={testProduct}
                onChange={(e) => setTestProduct(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-lg"
                onKeyPress={(e) => e.key === 'Enter' && testLiveCompetitorData()}
              />
              <button
                onClick={testLiveCompetitorData}
                disabled={!testProduct || refreshing}
                className="flex items-center space-x-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span>{refreshing ? 'Searching...' : 'Get Prices'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-black" />
                <span>10+ UK alcohol retailers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-black" />
                <span>AI-powered market insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-black" />
                <span>Auto-saved to database</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { 
                label: 'Products Monitored', 
                value: overviewStats.totalProducts, 
                icon: Target,
                description: 'Active competitive analysis'
              },
              { 
                label: 'Price Decreases Needed', 
                value: overviewStats.needPriceDecrease, 
                icon: ArrowDown,
                description: 'Above market pricing'
              },
              { 
                label: 'Price Increases Possible', 
                value: overviewStats.needPriceIncrease, 
                icon: ArrowUp,
                description: 'Below market pricing'
              },
              { 
                label: 'High Priority Actions', 
                value: overviewStats.highUrgency, 
                icon: AlertTriangle,
                description: 'Immediate attention required'
              },
              { 
                label: 'Price Advantage', 
                value: `${overviewStats.avgPriceAdvantage > 0 ? '+' : ''}${overviewStats.avgPriceAdvantage.toFixed(1)}%`, 
                icon: DollarSign,
                description: 'vs market average'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-8 w-8 text-black" />
                  <div className="text-3xl font-bold text-black">{stat.value}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-black">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
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
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Main Data Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-black">Competitive Price Analysis</h3>
              <p className="text-gray-600 text-sm">Real-time pricing intelligence from UK alcohol retailers</p>
            </div>
            
            {filteredData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  {loading ? 'Loading...' : 'Test Live Competitive Intelligence'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Enter a product name above to get real-time competitive pricing from UK alcohol retailers.
                </p>
                <div className="space-y-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setTestProduct('Grey Goose Vodka')}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Try: Grey Goose Vodka
                    </button>
                    <button
                      onClick={() => setTestProduct('Macallan 12 Whisky')}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Try: Macallan 12 Whisky
                    </button>
                    <button
                      onClick={() => setTestProduct('Hendricks Gin')}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Try: Hendricks Gin
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Click any suggestion or enter your own product name
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Market Position</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Competitor Prices</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.sku} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-black">{item.sku}</div>
                              {item.sku.startsWith('LIVE-') && (
                                <span className="text-xs bg-black text-white px-2 py-1 rounded font-medium">LIVE DATA</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className={cn(
                              "inline-flex px-2 py-1 text-xs font-bold rounded",
                              item.market_position.price_advantage > 10 ? 'bg-red-100 text-red-800' :
                              item.market_position.price_advantage < -10 ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {item.market_position.price_advantage > 0 ? '+' : ''}{item.market_position.price_advantage.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              vs market average
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {item.competitor_prices.slice(0, 5).map((comp, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-black">{comp.competitor}</span>
                                  {comp.promotional && (
                                    <span className="px-2 py-1 bg-black text-white text-xs rounded font-medium">PROMO</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">£{comp.competitor_price.toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                            {item.competitor_prices.length > 5 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{item.competitor_prices.length - 5} more retailers
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {getActionIcon(item.recommendations.action)}
                              <span className="font-bold capitalize">
                                {item.recommendations.action}
                              </span>
                              {item.recommendations.target_price && (
                                <span className="text-sm text-gray-600">
                                  → £{item.recommendations.target_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className={cn(
                              "inline-flex px-2 py-1 text-xs font-bold rounded", 
                              getUrgencyColor(item.recommendations.urgency)
                            )}>
                              {item.recommendations.urgency} priority
                            </div>
                            <p className="text-sm text-gray-600 max-w-xs">
                              {item.recommendations.reasoning}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Getting Started */}
          {filteredData.length === 0 && !loading && (
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="text-center space-y-6">
                <h3 className="text-xl font-bold text-black">Getting Started</h3>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-black">Option 1: Test Individual Products</h4>
                    <p className="text-gray-600">
                      Use the search box above to test specific alcohol products. We'll fetch real prices from UK retailers.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-black" />
                        <span>10+ UK alcohol retailers</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-black" />
                        <span>Real-time SERP API data</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-black" />
                        <span>AI-powered insights</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-black">Option 2: Upload Your Inventory</h4>
                    <p className="text-gray-600">
                      Upload your complete inventory CSV to get competitive analysis for all your products automatically.
                    </p>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Upload Inventory CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}