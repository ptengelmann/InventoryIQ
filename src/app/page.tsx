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
    quote: "OscarAI's AI detected a £180k revenue opportunity we completely missed. The competitive intelligence showed us exactly when to launch at Morrisons and at what price point. We hit our revenue target in 3 weeks instead of the planned 6 months.",
    author: "Sarah Mitchell",
    title: "Brand Manager, Premium Spirits Co.",
    avatar: "SM"
  },
  {
    quote: "What used to cost us £50k in McKinsey consulting fees now happens automatically every morning. The AI identifies market gaps, predicts competitor moves, and generates strategies with precise revenue forecasts. It's like having a team of analysts working 24/7.",
    author: "David Chen",
    title: "Head of Commercial Intelligence, Independent Whisky Distillery",
    avatar: "DC"
  },
  {
    quote: "The AI prevented a £290k revenue loss by alerting us to competitive threats 48 hours before they would have cost us major accounts. The automated seasonal strategies alone generated £400k in additional revenue last quarter.",
    author: "Maria Rodriguez",
    title: "UK Market Director, International Wine & Spirits",
    avatar: "MR"
  }
]

const howItWorksSteps = [
  {
    step: 1,
    title: "AI Brand Intelligence Setup",
    headline: "15-minute setup, enterprise-grade intelligence",
    description: "Upload your product portfolio and our AI instantly recognizes your alcohol brands with 98% accuracy. No complex integrations - our advanced machine learning begins monitoring your competitive landscape across 20+ UK retailers within minutes.",
    features: [
      "AI recognizes brands automatically - zero manual tagging",
      "Enterprise-grade security with SOC2 compliance",
      "Works with any data format - CSV, Excel, API",
      "Covers spirits, wine, beer, RTD, craft categories",
      "Instant competitive landscape analysis upon upload"
    ],
    icon: Upload
  },
  {
    step: 2,
    title: "Real-Time Competitive Warfare",
    headline: "AI monitors competitors 24/7 so you don't have to",
    description: "Our AI continuously tracks competitor pricing, stock levels, and promotional activity across major UK retailers. Get instant alerts with revenue impact predictions when competitors make moves that could cost you sales or create opportunities.",
    features: [
      "Real-time competitive threat detection with £ impact",
      "Stock-out opportunity alerts with revenue forecasts",
      "Promotional pressure monitoring and response strategies",
      "Distribution gap analysis with expansion recommendations"
    ],
    icon: MonitorSpeaker
  },
  {
    step: 3,
    title: "Strategic Revenue Intelligence",
    headline: "AI generates strategies that drive real results",
    description: "Get McKinsey-level strategic intelligence delivered daily. Our AI analyzes market patterns, competitor behavior, and seasonal trends to generate actionable strategies with precise revenue predictions for your brand.",
    features: [
      "Portfolio health scoring (1-10) with improvement roadmap",
      "AI-generated seasonal strategies with revenue projections",
      "Competitive positioning analysis vs market leaders",
      "Revenue optimization recommendations with £ precision",
      "Market expansion opportunities with ROI forecasts"
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