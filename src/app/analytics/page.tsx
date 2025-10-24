'use client'

import React, { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  Activity,
  BarChart3,
  Calendar,
  Package,
  Award,
  Info,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react'

interface ActionStats {
  total_actions: number
  completed_actions: number
  pending_actions: number
  failed_actions: number
  total_expected_impact: number
  total_actual_impact: number
  success_rate: number
  avg_confidence: number
}

interface ActionBreakdown {
  action_type: string
  count: number
  expected_impact: number
  actual_impact: number
  success_rate: number
}

interface RecentAction {
  id: string
  action_type: string
  target_sku: string
  status: string
  expected_impact: number
  actual_impact: number | null
  confidence_score: number
  initiated_at: string
  completed_at: string | null
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, login, isLoading } = useUser()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<ActionStats | null>(null)
  const [breakdown, setBreakdown] = useState<ActionBreakdown[]>([])
  const [recentActions, setRecentActions] = useState<RecentAction[]>([])

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

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analytics/performance?userId=${encodeURIComponent(user.email)}`)

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setStats(data.stats)
      setBreakdown(data.breakdown)
      setRecentActions(data.recent_actions)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-light text-white">Access Required</h2>
            <p className="text-white/60">Please sign in to view analytics.</p>
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate accuracy percentage
  const accuracyPercentage = stats && stats.total_expected_impact > 0
    ? Math.round((stats.total_actual_impact / stats.total_expected_impact) * 100)
    : 0

  const impactDifference = stats
    ? stats.total_actual_impact - stats.total_expected_impact
    : 0

  return (
    <div className="min-h-screen bg-black">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Impact Analytics</h1>
          <p className="text-white/60">Track predicted vs actual impact from AI-powered actions</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-lg font-medium text-red-300">Error Loading Analytics</h3>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && stats && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Actions */}
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Total Actions</div>
                    <div className="text-3xl font-bold text-white">{stats.total_actions}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-white/70">{stats.completed_actions} completed</span>
                </div>
              </div>

              {/* Expected Impact */}
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Expected Impact</div>
                    <div className="text-3xl font-bold text-purple-400">
                      £{Math.round(stats.total_expected_impact).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-white/50">AI predictions</div>
              </div>

              {/* Actual Impact */}
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Actual Impact</div>
                    <div className="text-3xl font-bold text-green-400">
                      £{Math.round(stats.total_actual_impact).toLocaleString()}
                    </div>
                  </div>
                </div>
                {impactDifference !== 0 && (
                  <div className={`flex items-center space-x-1 text-sm ${impactDifference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {impactDifference > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    <span>£{Math.abs(Math.round(impactDifference)).toLocaleString()} vs predicted</span>
                  </div>
                )}
              </div>

              {/* Accuracy */}
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/50">Accuracy</div>
                    <div className="text-3xl font-bold text-yellow-400">{accuracyPercentage}%</div>
                  </div>
                </div>
                <div className="text-xs text-white/50">Prediction accuracy</div>
              </div>
            </div>

            {/* Shopify Integration Banner */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Real-Time Impact Tracking Coming Soon
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Once Shopify integration is complete, actual impact will be automatically tracked by monitoring sales performance after action execution. This will provide:
                  </p>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>Real-time sales tracking for price changes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>Automated ROI calculations comparing before/after</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>AI model calibration based on actual outcomes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>Performance dashboards showing revenue attribution</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Breakdown by Type */}
            {breakdown.length > 0 && (
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-light text-white mb-6">Action Performance by Type</h3>
                <div className="space-y-4">
                  {breakdown.map((item) => (
                    <div key={item.action_type} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                            {item.action_type === 'price_update' && <DollarSign className="h-5 w-5 text-white/60" />}
                            {item.action_type === 'reorder_stock' && <Package className="h-5 w-5 text-white/60" />}
                            {item.action_type === 'launch_campaign' && <Target className="h-5 w-5 text-white/60" />}
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize">
                              {item.action_type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-white/50">{item.count} actions</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            £{Math.round(item.actual_impact).toLocaleString()}
                          </div>
                          <div className="text-xs text-white/50">
                            vs £{Math.round(item.expected_impact).toLocaleString()} predicted
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white/60">
                          Success Rate: <span className="text-green-400">{Math.round(item.success_rate)}%</span>
                        </div>
                        <div className={`${item.actual_impact >= item.expected_impact ? 'text-green-400' : 'text-yellow-400'}`}>
                          {item.actual_impact >= item.expected_impact ? '✓ Met expectations' : '⚠ Below target'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Actions Table */}
            {recentActions.length > 0 && (
              <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                <h3 className="text-xl font-light text-white mb-6">Recent Actions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-medium text-white/50 pb-3">Action</th>
                        <th className="text-left text-xs font-medium text-white/50 pb-3">SKU</th>
                        <th className="text-left text-xs font-medium text-white/50 pb-3">Status</th>
                        <th className="text-right text-xs font-medium text-white/50 pb-3">Expected</th>
                        <th className="text-right text-xs font-medium text-white/50 pb-3">Actual</th>
                        <th className="text-center text-xs font-medium text-white/50 pb-3">Confidence</th>
                        <th className="text-left text-xs font-medium text-white/50 pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActions.map((action) => (
                        <tr key={action.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 text-white/70 text-sm capitalize">
                            {action.action_type.replace(/_/g, ' ')}
                          </td>
                          <td className="py-4 text-white/70 text-sm font-mono">
                            {action.target_sku}
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              action.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              action.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              action.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {action.status}
                            </span>
                          </td>
                          <td className="py-4 text-right text-white/70 text-sm">
                            £{Math.round(action.expected_impact).toLocaleString()}
                          </td>
                          <td className="py-4 text-right text-sm">
                            {action.actual_impact !== null ? (
                              <span className={action.actual_impact >= action.expected_impact ? 'text-green-400' : 'text-yellow-400'}>
                                £{Math.round(action.actual_impact).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-white/40">Pending</span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Percent className="h-3 w-3 text-white/40" />
                              <span className="text-white/70 text-sm">
                                {Math.round(action.confidence_score * 100)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-white/50 text-sm">
                            {new Date(action.initiated_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {stats.total_actions === 0 && (
              <div className="bg-white/5 border border-white/20 rounded-lg p-12 text-center">
                <Activity className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Actions Yet</h3>
                <p className="text-white/60 mb-6">
                  Execute AI recommendations from the dashboard to start tracking impact
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
