'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { AuthModal } from '@/components/ui/auth-modals'
import { Navbar } from '@/components/ui/navbar'

// Import all icons in a single line
import { 
  ArrowRight,
  Shield,
  Briefcase,
  Play,
  MonitorSpeaker,
  Target,
  Brain,
  Upload,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  PieChart,
  Activity,
  Award,
  Building,
  Globe,
  CheckCircle,
  Store,
  Package,
  Star,
  Users,
  Zap,
  Calendar,
  Wine,
  X
} from 'lucide-react'

// Import modular components
import { HeroSection } from '@/components/landing/hero-section'
import { InteractiveDemo } from '@/components/landing/interactive-demo'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { CallToActionSection } from '@/components/landing/call-to-action-section'
import { Footer } from '@/components/landing/footer'
import { DemoBookingModal } from '@/components/landing/demo-booking-modal'

// Helper data - keeps the main component clean
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

const howItWorksSteps = [
  {
    step: 1,
    title: "Connect Your Brand Data",
    headline: "Upload Your Product Portfolio",
    description: "Simply upload a CSV with your product SKUs, current wholesale/RRP prices, and distribution data. Our AI instantly recognizes your alcohol brands and begins monitoring them across 20+ UK retailers. Perfect for brand managers tracking multiple product lines.",
    features: [
      "Works with existing distributor data exports",
      "Automatically identifies your brand portfolio", 
      "Instant setup - no complex integrations",
      "Handles spirits, wine, beer, RTD products",
      "Secure, enterprise-grade data handling"
    ],
    icon: Upload
  },
  {
    step: 2,
    title: "Real-Time Market Monitoring",
    headline: "Track Your Brand Across UK Retail",
    description: "Our AI continuously monitors your brand performance across Majestic Wine, Waitrose, Tesco, ASDA, and 20+ other UK retailers. Get instant alerts when competitors change pricing, your products go out of stock, or new distribution opportunities arise.",
    features: [
      "24/7 retailer monitoring",
      "Real-time price updates",
      "Live stock alerts",
      "Automatic competitor tracking"
    ],
    icon: MonitorSpeaker
  },
  {
    step: 3,
    title: "Strategic Brand Insights",
    headline: "Optimize Your Market Strategy",
    description: "Get AI-powered recommendations on pricing strategy, distribution gaps, and competitive positioning. Identify which retailers are driving growth, where competitors are vulnerable, and which markets offer the biggest opportunities for your brand.",
    features: [
      "Competitive positioning analysis",
      "Market share tracking",
      "Strategic recommendations",
      "Growth opportunity identification"
    ],
    icon: Brain
  }
]

const features = [
  {
    icon: MonitorSpeaker,
    title: "Real-Time Monitoring",
    description: "Track performance across 20+ UK retailers with live alerts and competitive intelligence"
  },
  {
    icon: Brain,
    title: "AI Insights", 
    description: "Strategic recommendations on pricing, positioning, and market opportunities powered by AI"
  },
  {
    icon: Target,
    title: "Competitive Intelligence",
    description: "Monitor competitor strategies and identify market gaps in real-time across all channels"
  }
]

export default function ProductionReadyLanding() {
  const router = useRouter()
  const { user, login } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [demoModalOpen, setDemoModalOpen] = useState(false)
  
  // Interactive states
  const [animatedNumber, setAnimatedNumber] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  // Animation effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedNumber < 85) {
        setAnimatedNumber(prev => prev + 1)
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [animatedNumber])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleSignup = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  const handleForgotPassword = () => {
    setAuthMode('reset')
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

  // Updated switchAuthMode to handle reset mode properly
  const switchAuthMode = () => {
    if (authMode === 'login') {
      setAuthMode('signup')
    } else if (authMode === 'signup') {
      setAuthMode('login')
    } else if (authMode === 'reset') {
      setAuthMode('login')
    }
  }

  // New function specifically for forgot password
  const handleSwitchToReset = () => {
    setAuthMode('reset')
  }

  const handleBookDemo = () => {
    setDemoModalOpen(true)
  }

  const handleWatchDemo = () => {
    router.push('/competitive')
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Clean black background with minimal grid overlay */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Pure black background */}
        <div className="absolute inset-0 bg-black" />
        
        {/* Subtle grid overlay for depth - no geometric circles */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(white 1px, transparent 1px),
                linear-gradient(90deg, white 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px'
            }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="relative z-50">
        <Navbar 
          onLogin={handleLogin} 
          onSignup={handleSignup}
          onForgotPassword={handleForgotPassword}
        />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSwitchToReset={handleSwitchToReset}
        onSuccess={handleAuthSuccess}
      />

      <main>
        <HeroSection 
          onBookDemo={handleBookDemo}
          onWatchDemo={handleWatchDemo}
        />
        
        <InteractiveDemo 
          animatedNumber={animatedNumber}
          scrollY={scrollY}
        />
        
        <HowItWorksSection 
          steps={howItWorksSteps}
        />
        
        <TestimonialsSection 
          testimonials={testimonials}
          currentTestimonial={currentTestimonial}
          setCurrentTestimonial={setCurrentTestimonial}
        />
        
        <FeaturesSection 
          features={features}
          scrollY={scrollY}
        />
        
        <CallToActionSection 
          onBookDemo={handleBookDemo}
        />
      </main>

      <Footer />

      <DemoBookingModal 
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  )
}