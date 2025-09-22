'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Zap,
  Shield,
  Play,
  DollarSign,
  Package,
  Clock,
  Target,
  Brain,
  Sparkles,
  Wine,
  Calendar,
  Globe,
  FileText,
  Truck,
  Upload,
  Building,
  Store,
  Eye,
  LineChart,
  PieChart,
  Activity,
  MapPin,
  TrendingDown,
  Award,
  Briefcase,
  MonitorSpeaker,
  Gauge,
  Scan
} from 'lucide-react'

export default function BrandFocusedLanding() {
  const router = useRouter()
  const { user, login } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  // Interactive states
  const [animatedNumber, setAnimatedNumber] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Animated counter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedNumber < 85) {
        setAnimatedNumber(prev => prev + 1)
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [animatedNumber])

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
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
    router.push('/dashboard')
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  const testimonials = [
    {
      quote: "OscarAI gives us real-time visibility into how our premium gin performs across every major UK retailer. The competitive intelligence is invaluable for our pricing strategy.",
      author: "Sarah Mitchell",
      title: "Brand Manager, Premium Spirits Co.",
      avatar: "SM"
    },
    {
      quote: "Understanding our market positioning vs competitors like Diageo and Pernod Ricard used to take weeks. Now we get instant insights into pricing gaps and opportunities.",
      author: "David Chen", 
      title: "Head of Commercial Intelligence, Independent Whisky Distillery",
      avatar: "DC"
    },
    {
      quote: "The automated alerts when competitors change pricing or when our products go out of stock at key retailers have saved us countless lost sales opportunities.",
      author: "Maria Rodriguez",
      title: "UK Market Director, International Wine & Spirits",
      avatar: "MR"
    }
  ]

  const features = [
    {
      icon: MonitorSpeaker,
      title: "Real-Time Retail Monitoring",
      description: "Track your brand performance across Majestic Wine, Waitrose, Tesco, ASDA and 20+ UK alcohol retailers in real-time",
      color: "from-gray-500 to-black",
      bgColor: "bg-gray-50",
      textColor: "text-gray-900"
    },
    {
      icon: Target,
      title: "Competitive Intelligence",
      description: "Monitor competitor pricing strategies and identify opportunities vs Diageo, Pernod Ricard, and other major brands",
      color: "from-gray-600 to-gray-900", 
      bgColor: "bg-gray-50",
      textColor: "text-gray-900"
    },
    {
      icon: Brain,
      title: "AI Brand Insights",
      description: "Get actionable recommendations on pricing, distribution gaps, and market share opportunities powered by alcohol industry AI",
      color: "from-gray-700 to-black",
      bgColor: "bg-gray-50", 
      textColor: "text-gray-900"
    }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Minimalist geometric background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gray-100/40 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            left: '5%',
            top: '15%'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gray-200/30 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * -0.008}px)`,
            right: '8%',
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

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
            <Building className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-800">Enterprise AI for Alcohol Brands</span>
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Monitor Your Brand
              <span className="block text-black">
                Across UK Retail
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Real-time competitive intelligence for alcohol brands. Track your performance across 
              <br />
              <span className="text-black font-semibold">Majestic Wine, Waitrose, Tesco, ASDA</span> and 20+ UK retailers.
              <br />
              <span className="text-gray-900 font-semibold">AI-powered insights to optimize pricing, distribution, and market share</span>
            </p>
          </div>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => !user ? handleSignup() : router.push('/analytics')}
              className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-black text-white font-semibold text-lg rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <Briefcase className="h-5 w-5" />
              <span>Book Enterprise Demo</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => router.push('/competitive')}
              className="group inline-flex items-center space-x-3 px-8 py-4 bg-white text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-black hover:text-black transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <Play className="h-5 w-5" />
              <span>Watch Live Demo</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-700" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-gray-700" />
              <span>Real-time UK retail data</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-gray-700" />
              <span>Trusted by leading brands</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-gray-700" />
              <span>AI-powered insights</span>
            </div>
          </div>
        </div>

        {/* Interactive Demo Preview - Brand Dashboard */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="ml-4 text-sm text-gray-600 font-medium">OscarAI Enterprise - AU Vodka Brand Intelligence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-900 font-medium">Live Data</span>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 font-semibold">Retail Coverage</h3>
                    <Store className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="text-3xl font-bold text-black mb-2">{animatedNumber}%</div>
                  <div className="text-gray-700 text-sm">UK Premium Off-Trade</div>
                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Majestic, Waitrose, Tesco, ASDA</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 font-semibold">Price Position</h3>
                    <Target className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="text-3xl font-bold text-black mb-2">+12%</div>
                  <div className="text-gray-700 text-sm">vs Category Average</div>
                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Premium positioning</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 font-semibold">Market Share</h3>
                    <PieChart className="h-6 w-6 text-gray-700" />
                  </div>
                  <div className="text-3xl font-bold text-black mb-2">15.2%</div>
                  <div className="text-gray-700 text-sm">Premium Vodka Segment</div>
                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-600">
                    <ArrowRight className="h-4 w-4" />
                    <span>+2.1% vs last quarter</span>
                  </div>
                </div>
              </div>

              {/* Live Competitive Intelligence Feed */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gray-700" />
                  <span>Live Competitive Intelligence</span>
                  <span className="px-2 py-1 bg-black text-white text-xs rounded-full font-medium">Real-time</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-gray-900">Grey Goose increased price 8% at Waitrose</span>
                    </div>
                    <span className="text-red-600 text-sm font-medium">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-gray-700" />
                      <span className="text-gray-900">AU Vodka now #2 in premium vodka at Tesco</span>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">1 hour ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-green-600" />
                      <span className="text-gray-900">Belvedere out of stock at 3 Majestic locations</span>
                    </div>
                    <span className="text-green-600 text-sm font-medium">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Brand-Focused */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Leading Alcohol Brands Use OscarAI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From upload to insights in three simple steps - built for brand teams
          </p>
        </div>

        <div className="space-y-20">
          {/* Step 1: Connect Your Brand Data */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="text-lg font-semibold text-gray-900">Connect Your Brand Data</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Upload Your Product Portfolio
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Simply upload a CSV with your product SKUs, current wholesale/RRP prices, and distribution data. 
                Our AI instantly recognizes your alcohol brands and begins monitoring them across 20+ UK retailers. 
                Perfect for brand managers tracking multiple product lines.
              </p>
              <div className="space-y-3">
                {[
                  "Works with existing distributor data exports",
                  "Automatically identifies your brand portfolio", 
                  "Instant setup - no complex integrations",
                  "Handles spirits, wine, beer, RTD products",
                  "Secure, enterprise-grade data handling"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-700 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all duration-300 transform hover:scale-105">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Upload your brand portfolio CSV</h4>
                    <p className="text-gray-600 text-sm">SKU, Brand, RRP, Distribution Channels</p>
                  </div>
                  
                  {/* Brand-focused file preview */}
                  <div className="bg-white rounded-lg p-4 text-left font-mono text-sm shadow-sm">
                    <div className="text-gray-900 mb-2">brand_portfolio.csv</div>
                    <div className="space-y-1 text-gray-700">
                      <div>SKU,Brand,Category,RRP,Channels</div>
                      <div className="animate-pulse">AU-VODKA-70CL,AU Vodka,Spirits,£32.99,Majestic</div>
                      <div className="animate-pulse" style={{animationDelay: '0.5s'}}>AU-VODKA-35CL,AU Vodka,Spirits,£18.99,Tesco</div>
                      <div className="animate-pulse" style={{animationDelay: '1s'}}>AU-GIN-70CL,AU Gin,Spirits,£29.99,Waitrose</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating brand elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center animate-bounce">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          {/* Step 2: Real-Time Market Monitoring */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="text-lg font-semibold text-gray-900">Real-Time Market Monitoring</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Track Your Brand Across UK Retail
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our AI continuously monitors your brand performance across Majestic Wine, Waitrose, Tesco, ASDA, 
                and 20+ other UK retailers. Get instant alerts when competitors change pricing, your products go 
                out of stock, or new distribution opportunities arise.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Retailers Monitored", value: "24/7" },
                  { label: "Price Updates", value: "Real-time" },
                  { label: "Stock Monitoring", value: "Live alerts" },
                  { label: "Competitor Tracking", value: "Automatic" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-lg font-bold text-black">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:order-1 relative">
              <div className="bg-gray-900 rounded-2xl p-6 text-green-400 font-mono text-sm shadow-2xl transform hover:scale-105 transition-transform">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400 ml-2">OscarAI Market Intelligence</span>
                </div>
                
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <span className="text-white">{'>'}</span> Scanning AU Vodka across retailers...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '1s'}}>
                    <span className="text-white">{'>'}</span> Monitoring competitor pricing...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '2s'}}>
                    <span className="text-white">{'>'}</span> Tracking stock levels...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '3s'}}>
                    <span className="text-white">{'>'}</span> Analyzing market position...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '4s'}}>
                    <span className="text-green-400">✓</span> Market scan complete!
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '5s'}}>
                    <span className="text-yellow-400">!</span> 2 competitor price changes detected
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '6s'}}>
                    <span className="text-gray-300">📊</span> Market share: +2.1% vs last quarter
                  </div>
                </div>
              </div>
              
              {/* Market monitoring visualization */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-black rounded-full flex items-center justify-center animate-pulse">
                <MonitorSpeaker className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Step 3: Strategic Brand Insights */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <span className="text-lg font-semibold text-gray-900">Strategic Brand Insights</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Optimize Your Market Strategy
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Get AI-powered recommendations on pricing strategy, distribution gaps, and competitive positioning. 
                Identify which retailers are driving growth, where competitors are vulnerable, and which markets 
                offer the biggest opportunities for your brand.
              </p>
              <div className="space-y-4">
                {[
                  { 
                    icon: Target,
                    title: "Competitive Positioning",
                    desc: "See exactly how your pricing compares vs Grey Goose, Belvedere, and other premium brands"
                  },
                  {
                    icon: TrendingUp, 
                    title: "Market Share Analysis",
                    desc: "Track your performance by retailer, region, and category segment"
                  },
                  {
                    icon: Brain,
                    title: "Strategic Recommendations", 
                    desc: "AI-powered insights on pricing opportunities, distribution gaps, and growth strategies"
                  }
                ].map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <insight.icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <p className="text-gray-600 text-sm">{insight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform">
                <div className="bg-black p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">AU Vodka Brand Intelligence Report</h4>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Live Data</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black">15.2%</div>
                      <div className="text-sm text-gray-600">Market Share</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-black">+12%</div>
                      <div className="text-sm text-gray-600">Price Premium</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Competitive Position</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">#2 in Premium</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Growth Opportunity</span>
                      <span className="text-gray-900 font-medium">£2.5M potential</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Next Action</span>
                      <span className="text-black font-medium">Expand to Morrisons</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all">
                    View Strategic Recommendations
                  </button>
                </div>
              </div>
              
              {/* Success indicators */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center animate-bounce">
                <Brain className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA after how it works */}
        <div className="text-center mt-16 pt-16 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to optimize your brand performance?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join leading alcohol brands using OscarAI for competitive intelligence
          </p>
          <button 
            onClick={() => !user ? handleSignup() : router.push('/analytics')}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-black text-white font-semibold text-lg rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <Briefcase className="h-5 w-5" />
            <span>Book Enterprise Demo</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Alcohol Brands</h2>
          <div className="flex items-center justify-center space-x-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-gray-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Feedback from brand teams</span>
          </div>
        </div>

        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-4xl mx-auto">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-lg">"</span>
            </div>
          </div>
          
          <div className="text-center space-y-6">
            <p className="text-xl text-gray-700 leading-relaxed italic">
              {testimonials[currentTestimonial].quote}
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].author}</p>
                <p className="text-gray-600 text-sm">{testimonials[currentTestimonial].title}</p>
              </div>
            </div>
          </div>

          {/* Testimonial dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-black scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Current Capabilities */}
      <section className="bg-black py-20 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Enterprise Features Available Now
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Full platform capabilities ready for your brand team
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                icon: MonitorSpeaker, 
                title: "Real-Time Monitoring", 
                desc: "24/7 tracking across 20+ UK alcohol retailers",
                feature: "Live Now"
              },
              { 
                icon: Target, 
                title: "Competitive Intelligence", 
                desc: "Monitor pricing vs all major alcohol brands",
                feature: "Live Now"
              },
              { 
                icon: Brain, 
                title: "AI Strategic Insights", 
                desc: "Market positioning and growth recommendations",
                feature: "Live Now"
              },
              { 
                icon: Briefcase, 
                title: "Enterprise Integrations", 
                desc: "Connect with your existing brand management tools",
                feature: "Custom Setup"
              }
            ].map((integration, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <integration.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-xl font-bold text-white mb-2">{integration.title}</div>
                <div className="text-gray-300 text-sm mb-2">{integration.desc}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  integration.feature === 'Live Now' ? 'bg-white/20 text-gray-200' :
                  'bg-white/10 text-white'
                }`}>
                  {integration.feature}
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "20+", label: "UK Retailers Tracked" },
              { number: "24/7", label: "Real-Time Monitoring" },
              { number: "500+", label: "Alcohol Brands" },
              { number: "99.9%", label: "Uptime SLA" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry-Specific Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built for Alcohol Brand Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized insights for spirits, wine, beer, and RTD brands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              category: "Premium Spirits",
              icon: "🥃",
              color: "from-gray-400 to-gray-700",
              benefits: [
                "Track vs Grey Goose, Belvedere pricing",
                "Monitor premium positioning strategy", 
                "Identify distribution gaps in key accounts",
                "Seasonal gifting opportunity alerts"
              ]
            },
            {
              category: "Wine Brands",
              icon: "🍷",
              color: "from-gray-500 to-gray-800",
              benefits: [
                "Vintage and varietal performance tracking",
                "Price positioning vs category leaders",
                "Regional distribution optimization",
                "Seasonal demand pattern analysis"
              ]
            },
            {
              category: "Craft Beer",
              icon: "🍺",
              color: "from-gray-400 to-gray-700",
              benefits: [
                "Independent vs major brewery pricing",
                "Seasonal release performance tracking",
                "Craft segment market share monitoring",
                "New distribution opportunity alerts"
              ]
            },
            {
              category: "RTD Brands",
              icon: "🥤",
              color: "from-gray-500 to-gray-900",
              benefits: [
                "Fast-moving category trend tracking",
                "Flavor innovation competitive analysis",
                "Target demographic purchase patterns",
                "Promotional effectiveness measurement"
              ]
            }
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-6">{category.category}</h3>
              <ul className="space-y-3">
                {category.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-700 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Final Enterprise CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gray-50 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200/40 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-300/40 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transform Your Brand Intelligence Today
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join leading alcohol brands using OscarAI for competitive intelligence, pricing optimization, and market share growth.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => !user ? handleSignup() : router.push('/analytics')}
                className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-black text-white font-semibold text-lg rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <Briefcase className="h-5 w-5" />
                <span>Book Enterprise Demo</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => router.push('/competitive')}
                className="inline-flex items-center space-x-2 px-8 py-4 text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Download Case Study</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-700" />
                <span>Enterprise security & compliance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-700" />
                <span>Dedicated customer success</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-gray-700" />
                <span>Custom integrations available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Wine className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-bold">OscarAI</span>
                <span className="px-3 py-1 bg-white/10 text-gray-300 text-sm font-medium rounded-full">
                  Enterprise
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Enterprise competitive intelligence for alcohol brands. Monitor your performance 
                across UK retail, optimize pricing strategies, and maximize market share with AI-powered insights.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Enterprise Security</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Globe className="h-4 w-4" />
                  <span>UK Market Focus</span>
                </span>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Brand Dashboard</a></li>
                <li><a href="/analytics" className="hover:text-white transition-colors">Market Intelligence</a></li>
                <li><a href="/competitive" className="hover:text-white transition-colors">Competitive Analysis</a></li>
                <li><a href="/alerts" className="hover:text-white transition-colors">Real-Time Alerts</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise Sales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Enterprise software for alcohol brands</span>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                © 2025 OscarAI. All rights reserved. Enterprise competitive intelligence for the alcohol industry.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}