'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Zap, ShoppingBag, Code, Bell, Settings, Plus, Database, ArrowRight, CheckCircle, Activity, Layers, RefreshCw, Target, TrendingUp, Package } from 'lucide-react'

export default function IntegrationsPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const handleLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleSignup = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = (userData: any) => {
    login(userData)
    setAuthModalOpen(false)
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 border border-white/20 rounded">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm">Integration roadmap 2025</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-light text-white leading-tight">
            Integrations roadmap
            <br />
            <span className="text-white/60">connecting your systems</span>
          </h1>

          <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            We're building powerful integrations with the platforms you already use. 
            Here's what's coming and when you can expect it.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="relative mb-16">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/20"></div>
          
          <div className="space-y-12">
            {/* Q1 2025 - Shopify */}
            <div className="relative flex items-start space-x-8">
              {/* Timeline dot */}
              <div className="relative z-10 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
                <ShoppingBag className="h-8 w-8 text-green-400" />
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-white/5 border border-white/20 rounded-lg p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-light text-white">Shopify Integration</h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded border border-green-500/30">
                        Q1 2025
                      </span>
                    </div>
                    <p className="text-white/60">Direct e-commerce platform connection</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium">90% Complete</div>
                    <div className="w-24 h-2 bg-white/20 rounded-full mt-1">
                      <div className="w-[90%] h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">What's Included:</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>Real-time inventory sync</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>Automated price updates</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>Sales performance tracking</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>Product catalog management</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-3">Business Impact:</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>15-30% revenue increase</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>80% reduction in manual work</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>24/7 competitive monitoring</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded font-medium hover:bg-green-500/30 transition-colors">
                    <Bell className="h-4 w-4" />
                    <span>Get Notified</span>
                  </button>
                  <span className="text-white/50 text-sm">Expected: January 2025</span>
                </div>
              </div>
            </div>

            {/* Q2 2025 - Mintsoft */}
            <div className="relative flex items-start space-x-8">
              {/* Timeline dot */}
              <div className="relative z-10 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border-4 border-blue-500/30">
                <Package className="h-8 w-8 text-blue-400" />
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-white/5 border border-white/20 rounded-lg p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-light text-white">Mintsoft Integration</h3>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded border border-blue-500/30">
                        Q2 2025
                      </span>
                    </div>
                    <p className="text-white/60">Advanced warehouse management system</p>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-medium">60% Complete</div>
                    <div className="w-24 h-2 bg-white/20 rounded-full mt-1">
                      <div className="w-[60%] h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">Advanced Features:</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>Live warehouse stock levels</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>Automated reorder triggers</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>Expiry date optimization</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>Seasonal demand forecasting</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-3">Operational Benefits:</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>90% reduction in stockouts</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>Optimized storage efficiency</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>Improved cash flow</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-medium hover:bg-blue-500/30 transition-colors">
                    <Bell className="h-4 w-4" />
                    <span>Get Notified</span>
                  </button>
                  <span className="text-white/50 text-sm">Expected: April 2025</span>
                </div>
              </div>
            </div>

            {/* Q3 2025 - Custom API */}
            <div className="relative flex items-start space-x-8">
              {/* Timeline dot */}
              <div className="relative z-10 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                <Code className="h-8 w-8 text-white/60" />
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-white/5 border border-white/20 rounded-lg p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-light text-white">Enterprise API</h3>
                      <span className="px-3 py-1 bg-white/20 text-white/70 text-sm font-medium rounded border border-white/30">
                        Q3 2025
                      </span>
                    </div>
                    <p className="text-white/60">Custom integrations & enterprise solutions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white/70 font-medium">25% Complete</div>
                    <div className="w-24 h-2 bg-white/20 rounded-full mt-1">
                      <div className="w-[25%] h-2 bg-white/60 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-white mb-3">API Capabilities:</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span>RESTful API endpoints</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span>Real-time webhooks</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Settings className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span>Custom field mapping</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span>Event-driven automation</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-3">Enterprise Features:</h4>
                    <ul className="space-y-2 text-sm text-white/70">
                      <li className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span>Dedicated support</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span>Custom rate limits</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-white/60 flex-shrink-0" />
                        <span>Priority processing</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 text-white/70 border border-white/30 rounded font-medium hover:bg-white/30 transition-colors">
                    <Bell className="h-4 w-4" />
                    <span>Get Notified</span>
                  </button>
                  <span className="text-white/50 text-sm">Expected: July 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Early Access CTA */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-light text-white mb-4">Want early access?</h3>
          <p className="text-white/60 mb-6 max-w-2xl mx-auto">
            Join our beta program and get first access to new integrations. Help us build the features you need 
            and get exclusive early access before general availability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignup}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
            >
              <span>Join Beta Program</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <button className="inline-flex items-center space-x-2 px-8 py-4 bg-white/10 text-white border border-white/20 font-medium rounded hover:bg-white/15 transition-colors">
              <Bell className="h-4 w-4" />
              <span>Get Updates</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}