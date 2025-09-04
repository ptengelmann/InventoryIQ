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
  Upload
} from 'lucide-react'

export default function AlcoholIndustryLanding() {
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
      if (animatedNumber < 20) {
        setAnimatedNumber(prev => prev + 1)
      }
    }, 100)
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
      quote: "The inventory analysis gave us insights we hadn't considered before. It's helping us think differently about our beer selection.",
      author: "Mike Thompson",
      title: "Operations Manager, Local Brewery",
      avatar: "MT"
    },
    {
      quote: "Being able to upload our sales data and get immediate feedback on our wine category was useful for our planning.",
      author: "Sarah Davies", 
      title: "Buyer, Wine Retailer",
      avatar: "SD"
    },
    {
      quote: "The competitive pricing feature showed us where we stand against other retailers. That's valuable information.",
      author: "James Wilson",
      title: "Owner, Independent Off-License",
      avatar: "JW"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "Inventory Analysis",
      description: "Upload your CSV data and get AI-powered insights into your alcohol inventory patterns",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      icon: DollarSign,
      title: "Competitive Pricing Intelligence",
      description: "See how your prices compare to major UK alcohol retailers like Majestic Wine and Waitrose",
      color: "from-blue-500 to-cyan-500", 
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      icon: Shield,
      title: "UK Alcohol Focus",
      description: "Purpose-built for UK alcohol categories: beer, wine, spirits, and ready-to-drink products",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-100", 
      textColor: "text-orange-600"
    }
  ]

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

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-100 to-purple-100 px-4 py-2 rounded-full border border-amber-200">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Early-Stage AI for UK Alcohol Businesses</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Analyze Your Alcohol
              <span className="block bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Inventory Data
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Upload your sales and inventory data to get <strong>AI-powered insights</strong> into your alcohol business. 
              <br />
              Built specifically for <span className="text-amber-600 font-semibold">UK beer, wine, spirits & RTD categories</span>
              <br />
              <span className="text-purple-600 font-semibold">See competitive pricing from major UK retailers</span>
            </p>
          </div>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => !user ? handleSignup() : router.push('/analytics')}
              className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <span>Try It Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </button>
            
            <button 
              onClick={() => router.push('/competitive')}
              className="group inline-flex items-center space-x-3 px-8 py-4 bg-white text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-amber-400 hover:text-amber-600 transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <Target className="h-5 w-5" />
              <span>View Competitive Intel</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Free to try</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Upload CSV instantly</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>UK alcohol focused</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Your data stays private</span>
            </div>
          </div>
        </div>

        {/* Interactive Demo Preview */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="bg-gradient-to-r from-amber-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-600 font-medium">RolloAI Analysis Dashboard</span>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="group p-6 rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Realistic */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How RolloAI Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple CSV upload to AI-powered insights in three steps
          </p>
        </div>

        <div className="space-y-20">
          {/* Step 1: Upload */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="text-lg font-semibold text-amber-600">Upload Your Data</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Start with Your Existing Data
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Upload a CSV file with your inventory data. We work with standard formats that include product names, 
                prices, stock levels, and sales data. The system automatically recognizes alcohol categories and starts 
                the analysis immediately.
              </p>
              <div className="space-y-3">
                {[
                  "CSV format supported",
                  "Works with POS system exports", 
                  "Handles beer, wine, spirits, RTD products",
                  "Processes data in seconds",
                  "No complex setup required"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-amber-300 hover:border-amber-500 transition-all duration-300 transform hover:scale-105">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Drag & drop your CSV file</h4>
                    <p className="text-gray-600 text-sm">SKU, Price, Stock, Weekly Sales</p>
                  </div>
                  
                  {/* Animated file preview */}
                  <div className="bg-white rounded-lg p-4 text-left font-mono text-sm shadow-sm">
                    <div className="text-amber-600 mb-2">inventory_export.csv</div>
                    <div className="space-y-1 text-gray-700">
                      <div>SKU,Price,Stock,Weekly_Sales</div>
                      <div className="animate-pulse">IPA-001,£4.50,89,23</div>
                      <div className="animate-pulse" style={{animationDelay: '0.5s'}}>WINE-CH-2021,£12.99,45,8</div>
                      <div className="animate-pulse" style={{animationDelay: '1s'}}>GIN-HENDRICKS,£32.00,12,4</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Step 2: AI Analysis */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="text-lg font-semibold text-purple-600">AI Analysis</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Get Instant Insights
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our AI analyzes your data to identify patterns, pricing opportunities, and inventory risks. 
                It understands alcohol categories and provides recommendations specific to beer, wine, spirits, 
                and RTD products.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Category Recognition", value: "Automatic" },
                  { label: "Risk Detection", value: "Instant alerts" },
                  { label: "Price Analysis", value: "Optimization tips" },
                  { label: "Inventory Health", value: "Stock warnings" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-lg font-bold text-purple-600">{stat.value}</div>
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
                  <span className="text-gray-400 ml-2">RolloAI Analysis Engine</span>
                </div>
                
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <span className="text-amber-400">{'>'}</span> Processing CSV data...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '1s'}}>
                    <span className="text-amber-400">{'>'}</span> Categorizing alcohol products...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '2s'}}>
                    <span className="text-amber-400">{'>'}</span> Analyzing pricing patterns...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '3s'}}>
                    <span className="text-amber-400">{'>'}</span> Checking inventory levels...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '4s'}}>
                    <span className="text-green-400">✓</span> Analysis complete!
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '5s'}}>
                    <span className="text-yellow-400">!</span> Found 3 pricing opportunities
                  </div>
                </div>
              </div>
              
              {/* AI brain visualization */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Step 3: Results */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <span className="text-lg font-semibold text-green-600">Actionable Insights</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Make Data-Driven Decisions
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Get clear recommendations you can act on immediately. See competitive pricing from major UK retailers, 
                identify slow-moving stock, and spot pricing opportunities across your alcohol categories.
              </p>
              <div className="space-y-4">
                {[
                  { 
                    icon: Target,
                    title: "Competitive Pricing",
                    desc: "See how your prices compare to Majestic Wine, Waitrose, Tesco & ASDA"
                  },
                  {
                    icon: AlertTriangle, 
                    title: "Stock Alerts",
                    desc: "Identify overstocked items and products running low"
                  },
                  {
                    icon: TrendingUp,
                    title: "Pricing Opportunities", 
                    desc: "Spot products where you could adjust pricing for better margins"
                  }
                ].map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <insight.icon className="h-5 w-5 text-green-600" />
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
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Inventory Analysis Results</h4>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Ready to Review</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{animatedNumber}</div>
                      <div className="text-sm text-gray-600">Products Analyzed</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">3</div>
                      <div className="text-sm text-gray-600">Opportunities Found</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Analysis Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Complete</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Categories Detected</span>
                      <span className="text-gray-900 font-medium">Beer, Wine, Spirits</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Processing Time</span>
                      <span className="text-gray-900 font-medium">2.3 seconds</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all">
                    View Detailed Report
                  </button>
                </div>
              </div>
              
              {/* Success indicators */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA after story */}
        <div className="text-center mt-16 pt-16 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to analyze your alcohol inventory?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Upload your data and get insights in minutes, not days
          </p>
          <button 
            onClick={() => !user ? handleSignup() : router.push('/analytics')}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <span>Start Analysis</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Users Are Saying</h2>
          <div className="flex items-center justify-center space-x-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Feedback from early testers</span>
          </div>
        </div>

        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-4xl mx-auto">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">"</span>
            </div>
          </div>
          
          <div className="text-center space-y-6">
            <p className="text-xl text-gray-700 leading-relaxed italic">
              {testimonials[currentTestimonial].quote}
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
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
                  index === currentTestimonial ? 'bg-amber-600 scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Current Capabilities */}
      <section className="bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              What's Available Now
            </h2>
            <p className="text-amber-100 text-xl max-w-2xl mx-auto">
              Current features you can use today, plus our roadmap for future development
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                icon: FileText, 
                title: "CSV Upload & Analysis", 
                desc: "Upload your inventory data and get instant AI-powered insights",
                feature: "Available Now"
              },
              { 
                icon: Target, 
                title: "Competitive Intelligence", 
                desc: "Compare prices with major UK alcohol retailers",
                feature: "Available Now"
              },
              { 
                icon: BarChart3, 
                title: "Inventory Analytics", 
                desc: "Risk alerts and stock optimization recommendations",
                feature: "Available Now"
              },
              { 
                icon: Globe, 
                title: "POS Integration", 
                desc: "Direct connections with UK POS systems planned for future",
                feature: "Development Roadmap"
              }
            ].map((integration, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <integration.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-xl font-bold text-white mb-2">{integration.title}</div>
                <div className="text-amber-100 text-sm mb-2">{integration.desc}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  integration.feature === 'Available Now' ? 'bg-green-500/20 text-green-200' :
                  'bg-white/20 text-white'
                }`}>
                  {integration.feature}
                </div>
              </div>
            ))}
          </div>

          {/* Current Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "CSV", label: "Upload Format" },
              { number: "4", label: "UK Retailers Tracked" },
              { number: "Instant", label: "Analysis Speed" },
              { number: "Free", label: "To Try" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-amber-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry-Specific Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built for UK Alcohol Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI understands the unique characteristics of different alcohol categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              category: "Beer & Cider",
              icon: "🍺",
              color: "from-yellow-400 to-orange-500",
              benefits: [
                "Recognizes craft vs mass market",
                "Seasonal pattern detection", 
                "ABV and style categorization",
                "Stock rotation insights"
              ]
            },
            {
              category: "Wine",
              icon: "🍷",
              color: "from-purple-400 to-red-500",
              benefits: [
                "Vintage and varietal tracking",
                "Price per bottle analysis",
                "Region classification",
                "Age-appropriate recommendations"
              ]
            },
            {
              category: "Spirits",
              icon: "🥃",
              color: "from-amber-400 to-brown-500",
              benefits: [
                "Premium tier identification",
                "Brand positioning analysis",
                "Size variant optimization",
                "Margin opportunity detection"
              ]
            },
            {
              category: "RTD & Seltzers",
              icon: "🥤",
              color: "from-blue-400 to-teal-500",
              benefits: [
                "Trend momentum tracking",
                "Flavor profile analysis",
                "Target demographic insights",
                "Seasonal demand patterns"
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
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-br from-amber-50 to-purple-50 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Analyze Your Alcohol Inventory?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your data and get insights in minutes. See competitive pricing and optimization opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => !user ? handleSignup() : router.push('/analytics')}
                className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <span>Start Analysis</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => router.push('/competitive')}
                className="inline-flex items-center space-x-2 px-8 py-4 text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Target className="h-5 w-5" />
                <span>View Live Demo</span>
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Free to try • CSV upload • Instant results
            </p>
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
                <div className="w-8 h-8 bg-gradient-to-r from-amber-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Wine className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">RolloAI</span>
                <span className="px-3 py-1 bg-amber-600/20 text-amber-200 text-sm font-medium rounded-full">
                  Early Stage
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered inventory analysis for UK alcohol retailers, distributors, and brands. 
                Upload your data and get actionable insights in minutes.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Data Privacy Focused</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>UK Market Focused</span>
                </span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="/analytics" className="hover:text-white transition-colors">Data Analysis</a></li>
                <li><a href="/competitive" className="hover:text-white transition-colors">Competitive Intel</a></li>
                <li><a href="/alerts" className="hover:text-white transition-colors">Inventory Alerts</a></li>
              </ul>
            </div>

            {/* Alcohol Categories */}
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white transition-colors">Beer & Craft</li>
                <li className="hover:text-white transition-colors">Wine & Spirits</li>
                <li className="hover:text-white transition-colors">RTD & Seltzers</li>
                <li className="hover:text-white transition-colors">Cider & Other</li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Built for UK alcohol businesses</span>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                © 2025 RolloAI. All rights reserved. Early-stage product for UK alcohol market.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}