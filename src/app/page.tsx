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
  Sparkles
} from 'lucide-react'

export default function HomePage() {
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
      if (animatedNumber < 23) {
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
      company: 'InventoryIQ Demo',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA'
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
      quote: "InventoryIQ increased our profit margins by 34% in just 2 months. The AI predictions are incredibly accurate.",
      author: "Sarah Chen",
      title: "CEO, ModernStyle Co.",
      avatar: "SC"
    },
    {
      quote: "We prevented $50K in stockouts last quarter. This tool literally pays for itself within days.",
      author: "Marcus Rodriguez", 
      title: "Operations Director, TechGear",
      avatar: "MR"
    },
    {
      quote: "The demand forecasting is like having a crystal ball. We're always one step ahead of our customers.",
      author: "Emily Watson",
      title: "Founder, EcoLiving",
      avatar: "EW"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Forecasting",
      description: "Machine learning models predict demand with 95% accuracy",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      icon: Target,
      title: "Dynamic Pricing",
      description: "Optimize prices in real-time based on market conditions",
      color: "from-blue-500 to-cyan-500", 
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      icon: Zap,
      title: "Smart Alerts",
      description: "Get notified before stockouts happen, not after",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-100", 
      textColor: "text-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
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

      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Hero Section - Enhanced */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full border border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI-Powered Inventory Intelligence</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Turn Your Inventory Into
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Pure Profit
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              AI that <strong>predicts demand</strong>, <strong>optimizes prices</strong>, and <strong>prevents stockouts</strong>. 
              <br />
              <span className="text-blue-600 font-semibold">Average revenue increase: {animatedNumber}%</span>
            </p>
          </div>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSignup}
              className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
            </button>
            
            <button
              onClick={() => router.push('/analytics')}
              className="group inline-flex items-center space-x-3 px-8 py-4 bg-white text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-lg"
            >
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
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Enterprise security</span>
            </div>
          </div>
        </div>

        {/* Interactive Demo Preview */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-600 font-medium">InventoryIQ Dashboard</span>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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

      {/* Interactive "How It Works" Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How InventoryIQ Transforms Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From chaos to clarity in 3 simple steps. Watch your inventory optimization unfold.
          </p>
        </div>

        <div className="space-y-20">
          {/* Step 1: Upload */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="text-lg font-semibold text-blue-600">Upload Your Data</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Simply Drop Your CSV File
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                No complicated setup, no data formatting headaches. Just drag and drop your existing inventory file. 
                Our AI instantly understands your SKUs, prices, sales velocity, and stock levels.
              </p>
              <div className="space-y-3">
                {[
                  "Accepts any CSV format",
                  "Processes 10,000+ SKUs in seconds", 
                  "Auto-detects data patterns",
                  "Zero configuration required"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                    <Download className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Drop your inventory file here</h4>
                    <p className="text-gray-600 text-sm">CSV, Excel, or any format</p>
                  </div>
                  
                  {/* Animated file preview */}
                  <div className="bg-white rounded-lg p-4 text-left font-mono text-sm shadow-sm">
                    <div className="text-blue-600 mb-2">inventory_data.csv</div>
                    <div className="space-y-1 text-gray-700">
                      <div>SKU,Price,Sales,Stock</div>
                      <div className="animate-pulse">ABC123,29.99,45,120 ✨</div>
                      <div className="animate-pulse" style={{animationDelay: '0.5s'}}>XYZ789,15.50,23,89 ✨</div>
                      <div className="animate-pulse" style={{animationDelay: '1s'}}>DEF456,99.00,12,45 ✨</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
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
                <span className="text-lg font-semibold text-purple-600">AI Analyzes Everything</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Watch the Magic Happen
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our advanced AI doesn't just crunch numbers—it understands your business. It detects patterns, 
                predicts trends, and identifies opportunities you never knew existed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Demand Forecasting", value: "95% accuracy" },
                  { label: "Price Optimization", value: "Real-time" },
                  { label: "Risk Detection", value: "7 days early" },
                  { label: "Processing Speed", value: "< 30 seconds" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
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
                  <span className="text-gray-400 ml-2">InventoryIQ AI Engine</span>
                </div>
                
                <div className="space-y-2">
                  <div className="animate-pulse">
                    <span className="text-blue-400">{'>'}</span> Analyzing sales patterns...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '1s'}}>
                    <span className="text-blue-400">{'>'}</span> Detecting demand trends...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '2s'}}>
                    <span className="text-blue-400">{'>'}</span> Calculating optimal prices...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '3s'}}>
                    <span className="text-blue-400">{'>'}</span> Identifying risk factors...
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '4s'}}>
                    <span className="text-green-400">✓</span> Analysis complete!
                  </div>
                  <div className="animate-pulse" style={{animationDelay: '5s'}}>
                    <span className="text-yellow-400">$</span> Revenue opportunity: <span className="text-green-400">+$47,293</span>
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
                <span className="text-lg font-semibold text-green-600">Get Actionable Insights</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Transform Data Into Profit
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Receive crystal-clear recommendations that your team can implement immediately. 
                No guesswork, no complex analysis—just profitable actions.
              </p>
              <div className="space-y-4">
                {[
                  { 
                    icon: TrendingUp,
                    title: "Price Recommendations",
                    desc: "Increase SKU ABC123 price by 8% → +$2,340 monthly revenue"
                  },
                  {
                    icon: AlertTriangle, 
                    title: "Risk Alerts",
                    desc: "Reorder SKU XYZ789 now → Prevent $5,670 stockout loss"
                  },
                  {
                    icon: Target,
                    title: "Opportunity Detection", 
                    desc: "Launch promotion on Category Y → Clear $18K overstock"
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
                    <h4 className="font-semibold">Monthly Impact Report</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm">AI Confidence: 94%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+23%</div>
                      <div className="text-sm text-gray-600">Revenue Increase</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">-89%</div>
                      <div className="text-sm text-gray-600">Stockout Risk</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Implementation Time</span>
                      <span className="font-semibold">5 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Expected ROI</span>
                      <span className="font-semibold text-green-600">847%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Risk Level</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Low</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all">
                    Download Full Report
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
            Ready to see this magic in action?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join 1000+ businesses already using AI to optimize their inventory
          </p>
          <button
            onClick={handleSignup}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Rotating Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by 1000+ E-commerce Teams</h2>
          <div className="flex items-center justify-center space-x-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 font-medium">4.9/5 from 247 reviews</span>
          </div>
        </div>

        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-4xl mx-auto">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">"</span>
            </div>
          </div>
          
          <div className="text-center space-y-6">
            <p className="text-xl text-gray-700 leading-relaxed italic">
              {testimonials[currentTestimonial].quote}
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
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
                  index === currentTestimonial ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Real Results from Real Businesses
            </h2>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto">
              Our AI doesn't just make recommendations—it delivers measurable impact
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "23%", label: "Average Revenue Increase", icon: TrendingUp },
              { number: "89%", label: "Reduction in Stockouts", icon: Package },
              { number: "5min", label: "Setup Time", icon: Clock },
              { number: "$2.3M", label: "Saved Last Month", icon: DollarSign }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to 10x Your Inventory Performance?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join 1000+ e-commerce businesses using AI to optimize their inventory and maximize profits.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={handleSignup}
                className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleLogin}
                className="inline-flex items-center space-x-2 px-8 py-4 text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                <span>Sign In</span>
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Start seeing results in 24 hours. No commitments, no risk.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">InventoryIQ</span>
            </div>
            <p className="text-gray-400 mb-6">AI-Powered Inventory Optimization</p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © 2025 InventoryIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}