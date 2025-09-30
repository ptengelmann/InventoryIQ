'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { AuthModal } from '@/components/ui/auth-modals'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/landing/footer'
import {
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Activity,
  Database,
  Cpu,
  Network,
  Calendar,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login')
  const { user, login } = useUser()
  const router = useRouter()

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

  const switchAuthMode = () => {
    if (authMode === 'login') {
      setAuthMode('signup')
    } else if (authMode === 'signup') {
      setAuthMode('login')
    } else if (authMode === 'reset') {
      setAuthMode('login')
    }
  }

  const handleSwitchToReset = () => {
    setAuthMode('reset')
  }

  const mainFeatures = [
    {
      id: 'ai-intelligence',
      icon: Brain,
      title: 'AI Strategic Intelligence',
      tagline: 'McKinsey-level insights, delivered instantly',
      description: 'Our advanced AI analyzes market patterns, competitor behavior, and seasonal trends to generate actionable strategies with precise revenue predictions.',
      stats: { value: '£2M+', label: 'Revenue opportunities detected' },
      capabilities: [
        'Portfolio health scoring (1-10) with improvement roadmap',
        'Competitive positioning analysis vs market leaders',
        'Revenue impact predictions with £ precision',
        'AI-generated seasonal strategies with execution plans',
        'Market expansion opportunities with ROI forecasts',
        'Automated threat detection with urgency timelines'
      ],
      preview: {
        title: 'Live AI Analysis',
        content: [
          { type: 'critical', label: 'Revenue Threat', value: '£47k monthly risk detected' },
          { type: 'opportunity', label: 'Market Gap', value: '£180k expansion potential' },
          { type: 'strategy', label: 'AI Recommendation', value: 'Launch summer gin campaign' },
          { type: 'health', label: 'Portfolio Score', value: '8.5/10 (Excellent)' }
        ]
      }
    },
    {
      id: 'competitive-warfare',
      icon: Target,
      title: 'Real-time Competitive Warfare',
      tagline: 'Know your competitors\' moves before they cost you sales',
      description: 'Monitor pricing, stock levels, and promotional activity across 20+ UK retailers with instant alerts and revenue impact analysis.',
      stats: { value: '24/7', label: 'Live monitoring across 20+ retailers' },
      capabilities: [
        'Real-time competitor price monitoring with alerts',
        'Stock-out opportunity detection with revenue forecasts',
        'Promotional pressure analysis and response strategies',
        'Distribution gap identification with expansion targets',
        'Competitive threat assessment with urgency levels',
        'Market share tracking vs key competitors'
      ],
      preview: {
        title: 'Competitive Intelligence Feed',
        content: [
          { type: 'alert', label: 'Price Alert', value: 'Grey Goose dropped 12% at Tesco' },
          { type: 'stock', label: 'Stock Gap', value: 'Belvedere out at Majestic Wine' },
          { type: 'opportunity', label: 'Expansion', value: '3 high-ROI retailers identified' },
          { type: 'monitoring', label: 'Coverage', value: '20+ UK retailers tracked' }
        ]
      }
    },
    {
      id: 'revenue-optimization',
      icon: TrendingUp,
      title: 'Revenue Optimization Engine',
      tagline: 'Turn every pricing decision into profit',
      description: 'AI-powered algorithms analyze price elasticity, market positioning, and seasonal patterns to maximize revenue at every price point.',
      stats: { value: '847%', label: 'Average ROI within 6 months' },
      capabilities: [
        'Dynamic pricing recommendations with profit optimization',
        'Price elasticity modeling for maximum revenue',
        'Seasonal demand forecasting with strategy generation',
        'Market positioning optimization vs competitors',
        'Revenue scenario modeling with risk assessment',
        'Profit margin analysis with improvement opportunities'
      ],
      preview: {
        title: 'Revenue Intelligence',
        content: [
          { type: 'revenue', label: 'Optimization', value: '£23k monthly increase potential' },
          { type: 'pricing', label: 'Optimal Price', value: '£29.99 (-9% current)' },
          { type: 'elasticity', label: 'Price Sensitivity', value: '15% volume impact at £2 increase' },
          { type: 'margin', label: 'Profit Boost', value: '18% margin improvement available' }
        ]
      }
    }
  ]

  const additionalFeatures = [
    {
      icon: Activity,
      title: 'Live Dashboard Intelligence',
      description: 'Real-time competitive intelligence with AI-powered insights and revenue impact analysis',
      features: ['Live competitor tracking', 'Revenue impact alerts', 'Market position monitoring', 'Strategic recommendations']
    },
    {
      icon: Calendar,
      title: 'AI Seasonal Strategies',
      description: 'Automatically generated seasonal campaigns with revenue projections and execution timelines',
      features: ['Demand forecasting', 'Campaign generation', 'Revenue projections', 'Execution roadmaps']
    },
    {
      icon: Database,
      title: 'Portfolio Health Assessment',
      description: 'Comprehensive analysis of your brand portfolio with actionable improvement recommendations',
      features: ['Health scoring (1-10)', 'Competitive vulnerability analysis', 'Growth opportunity identification', 'Performance benchmarking']
    },
    {
      icon: Network,
      title: 'Market Intelligence Network',
      description: 'Advanced web scraping and data collection across major UK alcohol retailers',
      features: ['20+ retailer coverage', 'Real-time data collection', 'Stock level monitoring', 'Promotional tracking']
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with SOC2 compliance and enterprise-level data protection',
      features: ['SOC2 Type II compliance', 'End-to-end encryption', 'Role-based access control', 'Audit trail logging']
    },
    {
      icon: Zap,
      title: 'Instant Setup & Integration',
      description: '15-minute setup with no complex integrations required - works with any inventory system',
      features: ['15-minute onboarding', 'CSV/Excel compatibility', 'API integrations available', 'Zero IT overhead']
    }
  ]

  const integrations = [
    { name: 'Excel/CSV', description: 'Direct data import/export', icon: Database },
    { name: 'Slack', description: 'Real-time alerts', icon: Network },
    { name: 'Email', description: 'Automated reports', icon: Globe },
    { name: 'REST API', description: 'Custom integrations', icon: Cpu },
    { name: 'Webhooks', description: 'Event notifications', icon: Zap },
    { name: 'Power BI', description: 'Advanced analytics', icon: BarChart3 }
  ]

  const retailers = [
    'Majestic Wine', 'Tesco', 'Waitrose', 'ASDA', 'Morrisons', 'Sainsbury\'s',
    'Amazon Fresh', 'Ocado', 'Co-op', 'Marks & Spencer', 'Iceland', 'Aldi',
    'Lidl', 'Spar', 'Budgens', 'WHSmith', 'Selfridges', 'Harrods', 'John Lewis', 'House of Fraser'
  ]

  return (
    <>
      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
        onForgotPassword={handleForgotPassword}
      />

      <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-400/30 rounded mb-8">
              <Brain className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Enterprise AI Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-light text-white leading-tight mb-8">
              The complete AI arsenal for
              <br />
              <span className="text-green-400">alcohol retail dominance</span>
            </h1>

            <p className="text-xl text-white/70 leading-relaxed mb-12 max-w-3xl mx-auto">
              From strategic intelligence to competitive warfare, our AI platform gives alcohol brands
              the unfair advantage they need to dominate UK retail markets.
            </p>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2">£2M+</div>
                <div className="text-sm text-white/60">Revenue opportunities detected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2">20+</div>
                <div className="text-sm text-white/60">UK retailers monitored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-2">847%</div>
                <div className="text-sm text-white/60">Average ROI in 6 months</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Three AI systems that revolutionize alcohol retail
            </h2>
            <p className="text-white/70 text-lg">
              While competitors use spreadsheets, you get enterprise-grade artificial intelligence
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {mainFeatures.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={cn(
                  "flex items-center space-x-3 px-6 py-3 rounded-lg border transition-all duration-300",
                  activeFeature === index
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white/80 hover:bg-white/8"
                )}
              >
{React.createElement(feature.icon, { className: "h-5 w-5" })}
                <span className="font-medium">{feature.title}</span>
              </button>
            ))}
          </div>

          {/* Active Feature Display */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  {React.createElement(mainFeatures[activeFeature].icon, { className: "h-6 w-6 text-green-400" })}
                </div>
                <div>
                  <h3 className="text-2xl font-light text-white">{mainFeatures[activeFeature].title}</h3>
                  <p className="text-green-400 text-sm">{mainFeatures[activeFeature].tagline}</p>
                </div>
              </div>

              <p className="text-white/70 text-lg leading-relaxed">
                {mainFeatures[activeFeature].description}
              </p>

              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-light text-white mb-2">
                    {mainFeatures[activeFeature].stats.value}
                  </div>
                  <div className="text-white/60 text-sm">
                    {mainFeatures[activeFeature].stats.label}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium mb-3">Key Capabilities:</h4>
                {mainFeatures[activeFeature].capabilities.map((capability, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70 text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-white/80 font-medium">{mainFeatures[activeFeature].preview.title}</span>
                <div className="flex items-center space-x-1 ml-auto">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">LIVE</span>
                </div>
              </div>

              <div className="space-y-3">
                {mainFeatures[activeFeature].preview.content.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded border",
                      item.type === 'critical' && "bg-red-500/10 border-red-500/20",
                      item.type === 'opportunity' && "bg-green-500/10 border-green-500/20",
                      item.type === 'strategy' && "bg-blue-500/10 border-blue-500/20",
                      item.type === 'health' && "bg-purple-500/10 border-purple-500/20",
                      item.type === 'alert' && "bg-orange-500/10 border-orange-500/20",
                      item.type === 'stock' && "bg-yellow-500/10 border-yellow-500/20",
                      item.type === 'monitoring' && "bg-gray-500/10 border-gray-500/20",
                      item.type === 'revenue' && "bg-emerald-500/10 border-emerald-500/20",
                      item.type === 'pricing' && "bg-cyan-500/10 border-cyan-500/20",
                      item.type === 'elasticity' && "bg-indigo-500/10 border-indigo-500/20",
                      item.type === 'margin' && "bg-pink-500/10 border-pink-500/20"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">{item.label}</span>
                      <span className="text-white font-medium text-sm">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Complete competitive intelligence ecosystem
            </h2>
            <p className="text-white/70 text-lg">
              Every tool alcohol brands need to dominate their market, powered by advanced AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/8 transition-colors duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
{React.createElement(feature.icon, { className: "h-5 w-5 text-white/60" })}
                  </div>
                  <h3 className="text-white font-medium">{feature.title}</h3>
                </div>

                <p className="text-white/60 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full flex-shrink-0" />
                      <span className="text-white/50 text-xs">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Retailers Coverage */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Complete UK retail coverage
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Monitor your brand across every major UK alcohol retailer in real-time
            </p>
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-400/30 rounded">
              <Globe className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm">20+ retailers • 24/7 monitoring • Real-time alerts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {retailers.map((retailer, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/8 transition-colors duration-300">
                <div className="w-8 h-8 bg-white/10 rounded mx-auto mb-2" />
                <span className="text-white/70 text-sm">{retailer}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Seamless integrations with your workflow
            </h2>
            <p className="text-white/70 text-lg">
              Connect OscarAI to the tools you already use - no complex setup required
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/8 transition-colors duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/15 transition-colors">
{React.createElement(integration.icon, { className: "h-6 w-6 text-white/60" })}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{integration.name}</h3>
                    <p className="text-white/60 text-sm">{integration.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/5 border border-white/20 rounded-lg p-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-400/30 rounded mb-8">
              <Star className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Join brands already gaining competitive advantage</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Ready to revolutionize your competitive intelligence?
            </h2>

            <p className="text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              See how our AI can detect £2M+ revenue opportunities for your alcohol brand.
              Book a demo and get your first strategic insights within 15 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button className="group px-8 py-4 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <span>Book Demo</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="px-8 py-4 border border-white/20 text-white font-medium rounded hover:border-white/40 transition-colors">
                View Live Demo
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-white/50 text-sm">
              <span>✓ 15-minute setup</span>
              <span>✓ No credit card required</span>
              <span>✓ Enterprise security</span>
            </div>
          </div>
        </div>
      </section>
      </div>

      <div className="bg-black">
        <Footer />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSwitchToReset={handleSwitchToReset}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}