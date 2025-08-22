// UPDATE: /src/components/ui/alert-dashboard.tsx - Add user context
'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext' // ✅ ADD THIS IMPORT
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Clock,
  CheckCircle,
  X,
  Bell,
  Brain,
  Zap,
  Target,
  RefreshCw,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react'
import { Alert } from '@/lib/alert-engine'
import { cn } from '@/lib/utils'

interface AlertDashboardProps {
  analysisId?: string
  onAcknowledge?: (alertId: string) => void
  onResolve?: (alertId: string) => void
  onDelete?: (alertId: string) => void
}

interface AlertStats {
  totalAlerts: number
  criticalAlerts: number
  unreadAlerts: number
  resolvedAlerts: number
  acknowledgementRate: number
  resolutionRate: number
}

export function AlertDashboard({ analysisId, onAcknowledge, onResolve, onDelete }: AlertDashboardProps) {
  const { user } = useUser() // ✅ ADD THIS
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'unread'>('all')
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (user) { // ✅ ONLY FETCH IF USER EXISTS
      fetchRealAlerts()
      fetchRealAlertStats()
    }
  }, [analysisId, user])

  const fetchRealAlerts = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching alerts for user:', user.email)
      
      const endpoint = analysisId 
        ? `/api/alerts/${analysisId}?userId=${user.email}`
        : `/api/alerts/latest?userId=${user.email}`
      
      console.log('Alert API endpoint:', endpoint)
      
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Alert API response:', data)
      
      setAlerts(data.alerts || [])
      
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
      // Fallback to demo data if API fails
      setAlerts(generateFallbackAlerts())
    } finally {
      setLoading(false)
    }
  }

  const fetchRealAlertStats = async () => {
    if (!user) return

    try {
      console.log('Fetching alert stats for user:', user.email)
      
      const response = await fetch(`/api/alerts/stats?userId=${user.email}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Alert stats response:', data)
        setAlertStats(data)
      } else {
        console.warn('Alert stats API failed, generating from current alerts')
        generateStatsFromAlerts()
      }
      
    } catch (err) {
      console.error('Error fetching alert stats:', err)
      generateStatsFromAlerts()
    }
  }

  const generateStatsFromAlerts = () => {
    const totalAlerts = alerts.length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    const unreadAlerts = alerts.filter(a => !a.acknowledged && !a.resolved).length
    const resolvedAlerts = alerts.filter(a => a.resolved).length
    
    setAlertStats({
      totalAlerts,
      criticalAlerts,
      unreadAlerts,
      resolvedAlerts,
      acknowledgementRate: totalAlerts > 0 ? ((totalAlerts - unreadAlerts) / totalAlerts * 100) : 0,
      resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts * 100) : 0
    })
  }

  const generateFallbackAlerts = (): Alert[] => {
    return [
      {
        id: 'alert-1-whiskey-stockout',
        rule_id: 'critical-stockout',
        sku: 'WHISKEY-001',
        category: 'spirits',
        type: 'stockout',
        severity: 'critical',
        title: 'CRITICAL STOCKOUT: WHISKEY-001',
        message: 'Buffalo Trace Bourbon will stockout in 3 days. Immediate reorder required to prevent lost sales.',
        action_required: 'EMERGENCY REORDER NOW',
        impact: {
          revenue_at_risk: 5500,
          time_to_critical: 3
        },
        data: {
          current_stock: 25,
          predicted_demand: 60,
          weeks_of_stock: 0.4,
          confidence: 0.92,
          trend: 'increasing'
        },
        alcohol_context: {
          abv: 40,
          shelf_life_days: 3650,
          seasonal_peak: '90 days',
          compliance_notes: ['High-proof spirits: Additional tax implications']
        },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: false,
        resolved: false,
        delivered_via: []
      }
    ]
  }

  const handleAcknowledge = async (alertId: string) => {
    if (!user) return

    try {
      if (analysisId) {
        await fetch(`/api/alerts/${analysisId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            alertId, 
            action: 'acknowledge',
            userId: user.email 
          })
        })
      }
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ))
      onAcknowledge?.(alertId)
      generateStatsFromAlerts()
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const handleResolve = async (alertId: string) => {
    if (!user) return

    try {
      if (analysisId) {
        await fetch(`/api/alerts/${analysisId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            alertId, 
            action: 'resolve',
            userId: user.email 
          })
        })
      }
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true, acknowledged: true } : alert
      ))
      onResolve?.(alertId)
      generateStatsFromAlerts()
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const handleDelete = async (alertId: string) => {
    if (!user) return

    try {
      setDeleting(alertId)
      
      if (analysisId) {
        await fetch(`/api/alerts/${analysisId}?alertId=${alertId}&userId=${user.email}`, {
          method: 'DELETE'
        })
      }
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      setSelectedAlerts(prev => prev.filter(id => id !== alertId))
      onDelete?.(alertId)
      generateStatsFromAlerts()
    } catch (error) {
      console.error('Failed to delete alert:', error)
    } finally {
      setDeleting(null)
    }
  }

  // Show loading if user not loaded yet
  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading user context...</p>
      </div>
    )
  }

  // Rest of component remains the same...
  const filteredAlerts = alerts.filter(alert => {
    if (alert.resolved && filter !== 'all') return false
    
    switch (filter) {
      case 'critical':
        return alert.severity === 'critical'
      case 'high':
        return alert.severity === 'high' || alert.severity === 'critical'
      case 'unread':
        return !alert.acknowledged && !alert.resolved
      default:
        return true
    }
  })

  const getSeverityBg = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200'
      case 'high': return 'bg-orange-50 border-orange-200'
      case 'medium': return 'bg-yellow-50 border-yellow-200'
      case 'low': return 'bg-blue-50 border-blue-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityTextColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'stockout': return Package
      case 'seasonal_prep': return Clock
      case 'competitor_threat': return Target
      case 'price_opportunity': return DollarSign
      case 'demand_spike': return TrendingUp
      default: return AlertTriangle
    }
  }

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const alertDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-900">Error Loading Alerts</h3>
        </div>
        <p className="text-red-700 mb-3">{error}</p>
        <button 
          onClick={() => {
            fetchRealAlerts()
            fetchRealAlertStats()
          }}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {alertStats?.totalAlerts || alerts.length}
              </p>
            </div>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {alertStats?.criticalAlerts || alerts.filter(a => a.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(alertStats?.resolutionRate || 0)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread Alerts</p>
              <p className="text-2xl font-bold text-orange-600">
                {alertStats?.unreadAlerts || alerts.filter(a => !a.acknowledged && !a.resolved).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filter Controls and Alert List */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Alerts ({filteredAlerts.length})</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
            {[
              { key: 'all', label: 'All', count: alerts.filter(a => !a.resolved).length },
              { key: 'critical', label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length },
              { key: 'high', label: 'High', count: alerts.filter(a => a.severity === 'high').length },
              { key: 'unread', label: 'Unread', count: alerts.filter(a => !a.acknowledged && !a.resolved).length }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  filter === filterOption.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {filterOption.label}
                {filterOption.count > 0 && (
                  <span className="ml-1 text-xs">({filterOption.count})</span>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              fetchRealAlerts()
              fetchRealAlertStats()
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts</h3>
            <p className="text-gray-600">
              {alerts.length === 0 
                ? "Upload a CSV file to generate alerts for your alcohol inventory."
                : "All alerts have been filtered out based on your current selection."
              }
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const AlertIcon = getAlertIcon(alert.type)
            
            return (
              <div
                key={alert.id}
                className={cn(
                  "bg-white rounded-xl p-6 border-l-4 shadow-sm hover:shadow-md transition-all",
                  getSeverityBg(alert.severity),
                  !alert.acknowledged && !alert.resolved && "ring-2 ring-blue-100"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      getSeverityBg(alert.severity)
                    )}>
                      <AlertIcon className={cn("h-5 w-5", getSeverityTextColor(alert.severity))} />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium uppercase",
                          getSeverityTextColor(alert.severity)
                        )}>
                          {alert.severity}
                        </span>
                        <span className="text-gray-500 text-sm">{getTimeAgo(alert.created_at)}</span>
                      </div>
                      
                      <p className="text-gray-700">{alert.message}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">Recommended Action:</span>
                        </div>
                        <p className="text-gray-700 font-medium">{alert.action_required}</p>
                      </div>
                      
                      {/* Impact Summary */}
                      {(alert.impact.revenue_at_risk || alert.impact.profit_opportunity || alert.impact.time_to_critical) && (
                        <div className="flex items-center space-x-4 text-sm">
                          {alert.impact.revenue_at_risk && (
                            <span className="text-red-600">Risk: ${alert.impact.revenue_at_risk.toLocaleString()}</span>
                          )}
                          {alert.impact.profit_opportunity && (
                            <span className="text-green-600">Opportunity: ${alert.impact.profit_opportunity.toLocaleString()}</span>
                          )}
                          {alert.impact.time_to_critical && (
                            <span className="text-orange-600">{alert.impact.time_to_critical} days to critical</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {!alert.resolved && (
                    <div className="flex items-center space-x-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Acknowledge</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        <X className="h-4 w-4" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deleting === alert.id}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
                      >
                        {deleting === alert.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AlertDashboard