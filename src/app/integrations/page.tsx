'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Zap, ShoppingBag, Code, Bell, Settings, Plus } from 'lucide-react'

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onSwitchMode={switchAuthMode}
          onSuccess={handleAuthSuccess}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Access Required</h2>
            <p className="text-gray-600">Please sign in to view integrations.</p>
            <button
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">Connect InventoryIQ with your favorite e-commerce platforms and tools.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center mb-12">
          <Zap className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Powerful Integrations Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're building seamless integrations with the most popular e-commerce platforms. 
            Soon you'll be able to automatically sync your inventory data and receive real-time recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/analytics')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Upload CSV For Now</span>
            </button>
            
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:border-gray-400 transition-colors">
              <Bell className="h-5 w-5" />
              <span>Get Notified When Ready</span>
            </button>
          </div>
        </div>

        {/* Coming Soon Integrations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Shopify</h3>
            <p className="text-gray-600 text-sm mb-4">
              Direct integration with your Shopify store. Auto-sync inventory, prices, and sales data.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Real-time inventory sync</li>
              <li>• Automatic price updates</li>
              <li>• Sales velocity tracking</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">WooCommerce</h3>
            <p className="text-gray-600 text-sm mb-4">
              Seamless WordPress integration. Perfect for custom e-commerce setups.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• WordPress plugin</li>
              <li>• Custom field mapping</li>
              <li>• Bulk price updates</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">BigCommerce</h3>
            <p className="text-gray-600 text-sm mb-4">
              Enterprise-grade integration for scaling businesses.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• API-first integration</li>
              <li>• Multi-store support</li>
              <li>• Advanced analytics</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">REST API</h3>
            <p className="text-gray-600 text-sm mb-4">
              Powerful API for custom integrations and enterprise solutions.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• RESTful endpoints</li>
              <li>• Webhook support</li>
              <li>• Rate limiting</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Slack Notifications</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get instant alerts in your Slack channels when critical inventory events occur.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Real-time alerts</li>
              <li>• Custom channels</li>
              <li>• Rich formatting</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Zapier</h3>
            <p className="text-gray-600 text-sm mb-4">
              Connect with 5000+ apps through Zapier automation platform.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• No-code automation</li>
              <li>• Trigger-based actions</li>
              <li>• Multi-step workflows</li>
            </ul>
          </div>
        </div>

        {/* Request Integration */}
        <div className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Need a Different Integration?</h3>
          <p className="text-gray-600 mb-6">
            We're always adding new integrations. Let us know which platform you'd like to see next!
          </p>
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            <span>Request Integration</span>
          </button>
        </div>
      </main>
    </div>
  )
}