'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { HistoryDashboard } from '@/components/ui/history-dashboard'
import { AlertDashboard } from '@/components/ui/alert-dashboard'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  BarChart3, 
  Bell, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Package,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'history'>('overview')
  
  // Mock alert count for badge
  const [alertCount, setAlertCount] = useState(4)
  const [criticalAlerts, setCriticalAlerts] = useState(1)

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

  // Redirect to home if not logged in
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
            <p className="text-gray-600">Please sign in to view your dashboard.</p>
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

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      count: null
    },
    {
      id: 'alerts',
      label: 'Smart Alerts',
      icon: Bell,
      count: alertCount,
      critical: criticalAlerts > 0
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: Clock,
      count: null
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your inventory optimization progress and insights.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "group inline-flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm relative",
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )} />
                    <span>{tab.label}</span>
                    
                    {/* Badge for alerts */}
                    {tab.count !== null && tab.count > 0 && (
                      <div className={cn(
                        "absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white",
                        tab.critical ? "bg-red-500 animate-pulse" : "bg-blue-500"
                      )}>
                        {tab.count}
                      </div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{alertCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center relative">
                    <Bell className="h-6 w-6 text-red-600" />
                    {criticalAlerts > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Critical Issues</p>
                    <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue Opportunity</p>
                    <p className="text-2xl font-bold text-green-600">$4,157</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">SKUs Monitored</p>
                    <p className="text-2xl font-bold text-blue-600">247</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-gray-700 mb-6">
                Your AI-powered inventory optimization system is actively monitoring your SKUs. 
                We've detected {alertCount} opportunities to improve your inventory performance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>View {criticalAlerts} Critical Alert{criticalAlerts !== 1 ? 's' : ''}</span>
                </button>
                
                <button
                  onClick={() => router.push('/analytics')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>Run New Analysis</span>
                </button>
              </div>
            </div>

            {/* Recent Activity Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Critical stock alert for DEF456</p>
                    <p className="text-xs text-gray-600">Only 0.4 weeks remaining • 30 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Price optimization opportunity for ABC123</p>
                    <p className="text-xs text-gray-600">$1,847 monthly opportunity • 2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Demand surge detected for GHI999</p>
                    <p className="text-xs text-gray-600">67% increase predicted • 4 hours ago</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setActiveTab('alerts')}
                className="w-full mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                View All Alerts
              </button>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <AlertDashboard
            onAcknowledge={(alertId) => {
              console.log('Acknowledged alert:', alertId)
              // Update alert count when alerts are acknowledged
              setAlertCount(prev => Math.max(0, prev - 1))
            }}
            onResolve={(alertId) => {
              console.log('Resolved alert:', alertId)
              // Update alert count when alerts are resolved
              setAlertCount(prev => Math.max(0, prev - 1))
              if (alertId === '1') { // Critical alert
                setCriticalAlerts(0)
              }
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard
            onSelectAnalysis={(analysisId) => {
              router.push(`/history?analysis=${analysisId}`)
            }}
          />
        )}
      </main>
    </div>
  )
}