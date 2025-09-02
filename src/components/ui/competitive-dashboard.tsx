// src/app/competitive/page.tsx - COMPLETE REPLACEMENT
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
  Zap,
  Package,
  Clock
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
      // Try to get real data first
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
      
      // Fallback to demo data
      const mockData: PriceComparisonResult[] = [
        {
          sku: 'HENDRICKS-GIN-700ML',
          our_price: 42.99,
          competitor_prices: [
            {
              sku: 'HENDRICKS-GIN-700ML',
              competitor: 'Majestic Wine',
              competitor_price: 39.99,
              our_price: 42.99,
              price_difference: -3.00,
              price_difference_percentage: -7.0,
              availability: true,
              last_updated: new Date(),
              source: 'majestic',
              url: 'https://majestic.co.uk/gin/hendricks-gin',
              product_name: 'Hendricks Gin 70cl',
              relevance_score: 0.95
            },
            {
              sku: 'HENDRICKS-GIN-700ML',
              competitor: 'Waitrose',
              competitor_price: 44.50,
              our_price: 42.99,
              price_difference: 1.51,
              price_difference_percentage: 3.5,
              availability: true,
              last_updated: new Date(),
              source: 'waitrose',
              product_name: 'Hendricks Gin 70cl',
              relevance_score: 0.92
            },
            {
              sku: 'HENDRICKS-GIN-700ML',
              competitor: 'Tesco',
              competitor_price: 41.00,
              our_price: 42.99,
              price_difference: -1.99,
              price_difference_percentage: -4.6,
              availability: true,
              last_updated: new Date(),
              source: 'tesco',
              product_name: 'Hendricks Gin 70cl',
              relevance_score: 0.88
            }
          ],
          market_position: {
            rank: 2,
            percentile: 67,
            price_advantage: -2.7
          },
          recommendations: {
            action: 'maintain',
            reasoning: 'Well positioned vs competitors - competitive but not lowest',
            urgency: 'low'
          }
        },
        {
          sku: 'MACALLAN-12-WHISKY',
          our_price: 89.99,
          competitor_prices: [
            {
              sku: 'MACALLAN-12-WHISKY',
              competitor: 'Majestic Wine',
              competitor_price: 85.00,
              our_price: 89.99,
              price_difference: -4.99,
              price_difference_percentage: -5.5,
              availability: true,
              last_updated: new Date(),
              source: 'majestic',
              product_name: 'Macallan 12 Year Old Single Malt',
              relevance_score: 0.97
            },
            {
              sku: 'MACALLAN-12-WHISKY',
              competitor: 'ASDA',
              competitor_price: 82.00,
              our_price: 89.99,
              price_difference: -7.99,
              price_difference_percentage: -8.9,
              availability: false,
              last_updated: new Date(),
              source: 'asda',
              product_name: 'Macallan 12yr Single Malt Whisky',
              relevance_score: 0.85
            }
          ],
          market_position: {
            rank: 3,
            percentile: 25,
            price_advantage: 6.8
          },
          recommendations: {
            action: 'decrease',
            target_price: 85.99,
            reasoning: 'Above market average - consider small price reduction',
            urgency: 'medium'
          }
        }
      ]
      
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
        category: 'spirits'
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
            reasoning: data.price_found_in_uploads ? 
              'Competitive analysis complete' : 
              'Upload inventory CSV to see price comparisons',
            urgency: 'low'
          }
        }
        
        // Calculate market position
        if (data.our_price > 0 && data.competitors.length > 0) {
          const allPrices = [data.our_price, ...data.competitors.map((c: any) => c.price)].sort((a, b) => a - b)
          const ourRank = allPrices.indexOf(data.our_price) + 1
          const percentile = ((allPrices.length - ourRank) / (allPrices.length - 1)) * 100
          const avgCompPrice = data.competitors.reduce((sum: number, c: any) => sum + c.price, 0) / data.competitors.length
          const priceAdvantage = ((data.our_price - avgCompPrice) / avgCompPrice) * 100
          
          newResult.market_position = {
            rank: ourRank,
            percentile: Math.round(percentile),
            price_advantage: Math.round(priceAdvantage * 100) / 100
          }
          
          // Generate better recommendations
          if (priceAdvantage > 15) {
            newResult.recommendations = {
              action: 'decrease',
              target_price: avgCompPrice * 1.05,
              reasoning: `Your price (£${data.our_price.toFixed(2)}) is ${priceAdvantage.toFixed(1)}% above market average (£${avgCompPrice.toFixed(2)})`,
              urgency: 'medium'
            }
          } else if (priceAdvantage < -15) {
            newResult.recommendations = {
              action: 'increase',
              target_price: avgCompPrice * 0.95,
              reasoning: `Your price is ${Math.abs(priceAdvantage).toFixed(1)}% below market - pricing opportunity`,
              urgency: 'low'
            }
          } else {
            newResult.recommendations = {
              action: 'maintain',
              reasoning: `Competitively positioned within ${Math.abs(priceAdvantage).toFixed(1)}% of market average`,
              urgency: 'low'
            }
          }
        }
        
        // Add to existing data (remove old entry with same product if exists)
        setCompetitorData(prev => {
          const filtered = prev.filter(item => !item.sku.includes(testProduct.replace(/\s+/g, '-').toUpperCase()))
          return [newResult, ...filtered]
        })
        
        setTestProduct('')
        
        // Show success message
        const message = data.competitors.length > 0 ? 
          `Found ${data.competitors.length} competitor prices for "${testProduct}"` :
          `No competitor prices found for "${testProduct}"`
        
        // Don't use alert() - update UI instead
        console.log(message)
        
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
    avgPriceAdvantage: competitorData.length > 0 ? 
      competitorData.reduce((sum, item) => sum + item.market_position.price_advantage, 0) / competitorData.length : 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
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

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time competitive pricing intelligence from major UK alcohol retailers. 
              Compare your prices against Majestic Wine, Waitrose, Tesco, and ASDA.
            </p>

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

          {/* Live Test Section */}
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
                {refreshing ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span>{refreshing ? 'Searching...' : 'Get Live Prices'}</span>
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

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              { 
                label: 'Products Monitored', 
                value: overviewStats.totalProducts, 
                icon: Target, 
                color: 'from-blue-500 to-purple-500',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-600'
              },
              { 
                label: 'Price Decreases Needed', 
                value: overviewStats.needPriceDecrease, 
                icon: ArrowDown, 
                color: 'from-red-500 to-pink-500',
                bgColor: 'bg-red-100',
                textColor: 'text-red-600'
              },
              { 
                label: 'Price Increases Possible', 
                value: overviewStats.needPriceIncrease, 
                icon: ArrowUp, 
                color: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-100',
                textColor: 'text-green-600'
              },
              { 
                label: 'High Priority', 
                value: overviewStats.highUrgency, 
                icon: AlertTriangle, 
                color: 'from-orange-500 to-red-500',
                bgColor: 'bg-orange-100',
                textColor: 'text-orange-600'
              },
              { 
                label: 'Price Advantage', 
                value: `${overviewStats.avgPriceAdvantage > 0 ? '+' : ''}${overviewStats.avgPriceAdvantage.toFixed(1)}%`, 
                icon: DollarSign, 
                color: 'from-purple-500 to-pink-500',
                bgColor: overviewStats.avgPriceAdvantage > 0 ? 'bg-red-100' : 'bg-green-100',
                textColor: overviewStats.avgPriceAdvantage > 0 ? 'text-red-600' : 'text-green-600'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className={cn("text-3xl font-bold", stat.textColor)}>{stat.value}</p>
                  </div>
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bgColor)}>
                    <stat.icon className={cn("h-7 w-7", stat.textColor)} />
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {loading ? 'Loading Competitive Data...' : 'Test Live Competitive Intelligence'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Use the search box above to test real competitor pricing from UK alcohol retailers like Majestic Wine, Waitrose, and Tesco.
                </p>
                <div className="space-y-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setTestProduct('Hendricks Gin')}
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      Try: Hendricks Gin
                    </button>
                    <button
                      onClick={() => setTestProduct('Macallan 12')}
                      className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Try: Macallan 12
                    </button>
                    <button
                      onClick={() => setTestProduct('BrewDog Punk IPA')}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Try: BrewDog Punk IPA
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Click any suggestion or type your own product name to see live competitor prices
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Our Price</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Market Position</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Competitors</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.sku} className="hover:bg-amber-50 transition-colors">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-purple-600 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{item.sku}</div>
                              {item.sku.startsWith('DEMO-') && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full mt-1 inline-block font-medium">Demo Data</span>
                              )}
                              {item.sku.startsWith('LIVE-') && (
                                <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full mt-1 inline-block font-medium">Live Data</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-2xl font-bold text-gray-900">£{item.our_price.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">
                            Rank #{item.market_position.rank} of {item.competitor_prices.length + 1}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className={cn(
                              "inline-flex px-3 py-1 text-sm font-bold rounded-full",
                              item.market_position.price_advantage > 10 ? 'bg-red-100 text-red-800' :
                              item.market_position.price_advantage < -10 ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            )}>
                              {item.market_position.price_advantage > 0 ? '+' : ''}{item.market_position.price_advantage.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.market_position.percentile}th percentile
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-3 max-w-sm">
                            {item.competitor_prices.slice(0, 3).map((comp, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-700 font-medium">{comp.competitor}</span>
                                  {comp.promotional && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">PROMO</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">£{comp.competitor_price.toFixed(2)}</div>
                                  <div className={cn(
                                    "text-xs",
                                    comp.price_difference_percentage > 0 ? 'text-green-600' : 'text-red-600'
                                  )}>
                                    {comp.price_difference_percentage > 0 ? '+' : ''}{comp.price_difference_percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            ))}
                            {item.competitor_prices.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{item.competitor_prices.length - 3} more retailers
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              {getActionIcon(item.recommendations.action)}
                              <span className="font-bold capitalize text-lg">
                                {item.recommendations.action}
                              </span>
                              {item.recommendations.target_price && (
                                <span className="text-sm text-gray-600">
                                  → £{item.recommendations.target_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className={cn(
                              "inline-flex px-3 py-1 text-xs font-bold rounded-full border-2", 
                              getUrgencyColor(item.recommendations.urgency)
                            )}>
                              {item.recommendations.urgency} urgency
                            </div>
                            <p className="text-sm text-gray-600 italic max-w-xs">
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

          {/* Getting Started Section for Empty State */}
          {filteredData.length === 0 && !loading && (
            <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-2xl p-8 border border-amber-200">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Getting Started with Competitive Intelligence</h3>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="text-left space-y-4">
                    <h4 className="font-semibold text-amber-800">Option 1: Test Individual Products</h4>
                    <p className="text-gray-600">
                      Use the search box above to test specific alcohol products. We'll fetch real prices from UK retailers.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Majestic Wine, Waitrose, Tesco, ASDA</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Real-time pricing data</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>AI-powered recommendations</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left space-y-4">
                    <h4 className="font-semibold text-purple-800">Option 2: Upload Your Inventory</h4>
                    <p className="text-gray-600">
                      Upload your complete inventory CSV to get competitive analysis for all your products automatically.
                    </p>
                    <button
                      onClick={() => router.push('/analytics')}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
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