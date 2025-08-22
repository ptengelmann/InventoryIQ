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
  Truck
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
      if (animatedNumber < 34) {
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
      company: 'Premium Spirits Co.',
      phone: '+1 (555) 123-4567',
      location: 'Napa Valley, CA'
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
      quote: "InventoryIQ helped us better understand our seasonal beer patterns and identify slow-moving stock. It's given us a clearer picture of what's working.",
      author: "Mike Thompson",
      title: "Operations Manager, Yorkshire Brewing Co.",
      avatar: "MT"
    },
    {
      quote: "The insights into our wine category performance have been really useful. We can see which lines are worth expanding and which aren't pulling their weight.",
      author: "Sarah Davies", 
      title: "Buyer, Premium Wine Ltd",
      avatar: "SD"
    },
    {
      quote: "As an independent retailer, having data-driven insights about our spirits category has helped us make better stocking decisions.",
      author: "James Wilson",
      title: "Owner, The Local Wine Shop",
      avatar: "JW"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "Smart Demand Analysis",
      description: "Identify seasonal patterns, track product performance, and spot trends in your sales data",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      icon: DollarSign,
      title: "Pricing Insights",
      description: "Data-driven pricing suggestions based on category performance and market positioning",
      color: "from-blue-500 to-cyan-500", 
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      icon: Shield,
      title: "UK Compliance Awareness",
      description: "Built with understanding of UK alcohol regulations and licensing requirements",
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
            <span className="text-sm font-medium text-amber-800">AI Inventory Intelligence for UK Alcohol Businesses</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Smarter Alcohol
              <span className="block bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Inventory Management
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              AI-powered insights to help you <strong>forecast demand patterns</strong>, <strong>optimize pricing decisions</strong>, and <strong>reduce waste</strong>. 
              <br />
              Built for <span className="text-amber-600 font-semibold">UK alcohol retailers, distributors & brands</span>
              <br />
              <span className="text-purple-600 font-semibold">Early users report improved inventory efficiency</span>
            </p>
          </div>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105">
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </button>
            
            <button className="group inline-flex items-center space-x-3 px-8 py-4 bg-white text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-amber-400 hover:text-amber-600 transition-all duration-300 shadow-sm hover:shadow-lg">
              <Play className="h-5 w-5" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Setup in minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>UK data protection compliant</span>
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
                <span className="ml-4 text-sm text-gray-600 font-medium">InventoryIQ Alcohol Commerce Dashboard</span>
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

      {/* How It Works Section - Alcohol-Specific */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How InventoryIQ Helps Your Alcohol Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From spreadsheet chaos to data-driven decisions in 3 simple steps. See how our platform works.
          </p>
        </div>

        <div className="space-y-20">
          {/* Step 1: Upload Alcohol Data */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="text-lg font-semibold text-amber-600">Upload Your Inventory Data</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Simply Upload Your Sales & Stock Data
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                No complicated setup required. Upload your existing inventory data from your POS system, spreadsheets, or sales reports. 
                Our system recognises product categories, pricing, and stock levels to start building insights immediately.
              </p>
              <div className="space-y-3">
                {[
                  "Accepts CSV and Excel formats",
                  "Handles hundreds of product lines", 
                  "Automatically categorises beer, wine, and spirits",
                  "Recognises seasonal patterns in your data",
                  "Works with UK product codes and pricing"
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
                    <Wine className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Upload your inventory data here</h4>
                    <p className="text-gray-600 text-sm">CSV files, spreadsheets, or POS exports</p>
                  </div>
                  
                  {/* Animated file preview */}
                  <div className="bg-white rounded-lg p-4 text-left font-mono text-sm shadow-sm">
                    <div className="text-amber-600 mb-2">uk_inventory.csv</div>
                    <div className="space-y-1 text-gray-700">
                      <div>Product,Category,Price,Stock,Sales</div>
                      <div className="animate-pulse">London Pride,Beer,£3.50,120,45 ✨</div>
                      <div className="animate-pulse" style={{animationDelay: '0.5s'}}>Chardonnay 2021,Wine,£12.99,89,23 ✨</div>
                      <div className="animate-pulse" style={{animationDelay: '1s'}}>Hendricks Gin,Spirits,£28.00,45,12 ✨</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-amber-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Step 2: AI Analysis - Alcohol Specific */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="text-lg font-semibold text-purple-600">AI Analyses Your Data</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Get Insights from Your Sales Patterns
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our AI examines your historical sales data to identify trends, seasonal patterns, and opportunities. 
                It looks at which products sell well together, when demand peaks, and where you might be missing sales opportunities.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Pattern Recognition", value: "Advanced algorithms" },
                  { label: "Category Analysis", value: "Beer, wine, spirits" },
                  { label: "Seasonal Trends", value: "Identifies peaks" },
                  { label: "Stock Insights", value: "Optimisation suggestions" }
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
                  <span className="text-gray-400 ml-2">InventoryIQ Alcohol AI Engine</span>
                </div>
                
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <span className="text-amber-400">{'>'}</span> Analyzing seasonal beer patterns...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '1s'}}>
                    <span className="text-amber-400">{'>'}</span> Checking wine vintage performance...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '2s'}}>
                    <span className="text-amber-400">{'>'}</span> Calculating spirits pricing elasticity...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '3s'}}>
                    <span className="text-amber-400">{'>'}</span> Validating TTB compliance...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '4s'}}>
                    <span className="text-green-400">✓</span> Alcohol commerce analysis complete!
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '5s'}}>
                    <span className="text-yellow-400">$</span> Holiday revenue opportunity: <span className="text-green-400">+$127,493</span>
                  </div>
                </div>
              </div>
              
              {/* AI brain visualization */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Step 3: Alcohol Commerce Results */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <span className="text-lg font-semibold text-green-600">Get Alcohol-Specific Insights</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Transform Data Into Alcohol Commerce Profits
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Receive crystal-clear recommendations tailored to alcohol commerce realities. 
                From holiday inventory prep to vintage rotation strategies—actionable insights your team can implement immediately.
              </p>
              <div className="space-y-4">
                {[
                  { 
                    icon: TrendingUp,
                    title: "Seasonal Price Optimization",
                    desc: "Increase craft beer prices 12% for summer → +$18,340 seasonal revenue"
                  },
                  {
                    icon: AlertTriangle, 
                    title: "Expiration Risk Alerts",
                    desc: "Rotate 2021 Chardonnay stock now → Prevent $12,670 spoilage loss"
                  },
                  {
                    icon: Calendar,
                    title: "Holiday Prep Intelligence", 
                    desc: "Order premium spirits for December → Capture $45K holiday demand"
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
                    <h4 className="font-semibold">Alcohol Commerce Impact Report</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">Compliance: 100%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+34%</div>
                      <div className="text-sm text-gray-600">Revenue Increase</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">-92%</div>
                      <div className="text-sm text-gray-600">Spoilage Risk</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">TTB Compliance</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Verified</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Expected ROI</span>
                      <span className="font-semibold text-green-600">1,247%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Holiday Readiness</span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm">Optimized</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all">
                    Download Compliance Report
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
            Ready to revolutionize your alcohol commerce?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join 500+ alcohol brands, distributors, and retailers already using AI to optimize their business
          </p>
          <button className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105">
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Rotating Testimonials - Alcohol Specific */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Early User Feedback</h2>
          <div className="flex items-center justify-center space-x-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">Early feedback from beta users</span>
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

      {/* Future Integration Roadmap */}
      <section className="bg-gradient-to-r from-amber-600 via-purple-600 to-pink-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for UK Alcohol Commerce
            </h2>
            <p className="text-amber-100 text-xl max-w-2xl mx-auto">
              Designed with UK alcohol businesses in mind, with plans for deeper integrations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { 
                icon: FileText, 
                title: "CSV Upload & Analysis", 
                desc: "Currently supports CSV upload with intelligent categorisation",
                feature: "Available Now"
              },
              { 
                icon: Globe, 
                title: "POS Integration Potential", 
                desc: "Future integrations with major UK POS systems planned",
                feature: "Roadmap 2025"
              },
              { 
                icon: BarChart3, 
                title: "UK Compliance Framework", 
                desc: "Built with understanding of UK alcohol regulations",
                feature: "Core Feature"
              },
              { 
                icon: Truck, 
                title: "Distributor Connections", 
                desc: "API framework ready for UK distributor integrations",
                feature: "In Development"
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
                  integration.feature === 'Core Feature' ? 'bg-blue-500/20 text-blue-200' :
                  'bg-white/20 text-white'
                }`}>
                  {integration.feature}
                </div>
              </div>
            ))}
          </div>

          {/* Current Capabilities */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "CSV", label: "File Upload Support" },
              { number: "20+", label: "Data Fields Recognised" },
              { number: "Real-time", label: "Analysis Speed" },
              { number: "UK", label: "Market Focus" }
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
            Built for Every Alcohol Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized AI models understand the unique challenges of each alcohol category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              category: "Beer & Cider",
              icon: "🍺",
              color: "from-yellow-400 to-orange-500",
              benefits: [
                "Seasonal demand forecasting",
                "Freshness date optimization", 
                "Craft vs. mass market pricing",
                "Festival & event planning"
              ]
            },
            {
              category: "Wine",
              icon: "🍷",
              color: "from-purple-400 to-red-500",
              benefits: [
                "Vintage performance tracking",
                "Cellar rotation strategies",
                "Varietal pricing optimization",
                "Harvest impact analysis"
              ]
            },
            {
              category: "Spirits",
              icon: "🥃",
              color: "from-amber-400 to-brown-500",
              benefits: [
                "Premium positioning insights",
                "Age statement value analysis",
                "Limited release strategies",
                "Holiday demand spikes"
              ]
            },
            {
              category: "RTD & Seltzers",
              icon: "🥤",
              color: "from-blue-400 to-teal-500",
              benefits: [
                "Trend momentum tracking",
                "Flavor performance analysis",
                "Seasonal pattern detection",
                "Youth market insights"
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

      {/* Interactive CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-br from-amber-50 to-purple-50 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Master Alcohol Commerce with AI?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 500+ alcohol brands, distributors, and retailers using intelligent AI commerce optimization.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-amber-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105">
                <span>Start Your Free Trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center space-x-2 px-8 py-4 text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors">
                <span>Schedule Demo</span>
              </button>
            </div>

            <p className="text-sm text-gray-500">
              See results in 24 hours. TTB compliant. Three-tier distribution ready.
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
                <span className="text-xl font-bold">InventoryIQ</span>
                <span className="px-3 py-1 bg-amber-600/20 text-amber-200 text-sm font-medium rounded-full">
                  Alcohol Commerce AI
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The leading AI-powered commerce optimization platform specifically designed for alcohol brands, 
                distributors, and retailers. Master seasonal demand, optimize pricing, and ensure compliance across all categories.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>TTB Compliant</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>SOC 2 Certified</span>
                </span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="/analytics" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="/competitive" className="hover:text-white transition-colors">Competitive Intel</a></li>
                <li><a href="/integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="/alerts" className="hover:text-white transition-colors">Smart Alerts</a></li>
              </ul>
            </div>

            {/* Industry Focus */}
            <div>
              <h4 className="font-semibold text-white mb-4">Alcohol Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white transition-colors">Beer & Craft Brewing</li>
                <li className="hover:text-white transition-colors">Wine & Vineyards</li>
                <li className="hover:text-white transition-colors">Spirits & Distilleries</li>
                <li className="hover:text-white transition-colors">RTD & Hard Seltzers</li>
                <li className="hover:text-white transition-colors">Cider & Mead</li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">TTB Compliance</a>
                <a href="#" className="hover:text-white transition-colors">API Documentation</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Integrates with:</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">RNDC</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">Southern Glazer's</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">300+ Distributors</span>
              </div>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                © 2025 InventoryIQ. All rights reserved. | TTB Compliant | SOC 2 Certified | Three-Tier Distribution Ready
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}