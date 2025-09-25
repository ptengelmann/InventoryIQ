// src/components/ui/alert-dashboard.tsx - DARK THEME VERSION
'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
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
  const { user } = useUser()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'unread'>('all')
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
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
      
      const endpoint = analysisId 
        ? `/api/alerts/${analysisId}?userId=${user.email}`
        : `/api/alerts/latest?userId=${user.email}`
      
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
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
      const response = await fetch(`/api/alerts/stats?userId=${user.email}`)
      
      if (response.ok) {
        const data = await response.json()
        setAlertStats(data)
      } else {
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
          time_to_critical: 3,
          urgency: 10
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
        delivered_via: [],
        metadata: {
          source: 'fallback',
          analysis_id: analysisId || 'demo'
        }
      },
      {
        id: 'alert-2-gin-opportunity',
        rule_id: 'price-opportunity',
        sku: 'GIN-005',
        category: 'spirits',
        type: 'price_opportunity',
        severity: 'high',
        title: 'PRICING OPPORTUNITY: GIN-005',
        message: 'Hendricks Gin underpriced vs competitors. 15% price increase opportunity detected.',
        action_required: 'INCREASE PRICE TO £47.99',
        impact: {
          revenue_at_risk: 0,
          profit_opportunity: 2800,
          time_to_critical: 0,
          urgency: 8
        },
        data: {
          current_stock: 180,
          predicted_demand: 45,
          weeks_of_stock: 4.0,
          confidence: 0.87,
          trend: 'stable'
        },
        alcohol_context: {
          abv: 41.4,
          shelf_life_days: 5475,
          seasonal_peak: '120 days',
          compliance_notes: []
        },
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
        acknowledged: false,
        resolved: false,
        delivered_via: [],
        metadata: {
          source: 'fallback',
          analysis_id: analysisId || 'demo'
        }
      },
      {
        id: 'alert-3-beer-seasonal',
        rule_id: 'seasonal-prep',
        sku: 'BEER-012',
        category: 'beer',
        type: 'seasonal_prep',
        severity: 'medium',
        title: 'SEASONAL PREP: BEER-012',
        message: 'Summer beer season approaching. Current stock insufficient for projected demand spike.',
        action_required: 'ORDER ADDITIONAL 200 UNITS',
        impact: {
          revenue_at_risk: 1200,
          time_to_critical: 14,
          urgency: 6
        },
        data: {
          current_stock: 80,
          predicted_demand: 120,
          weeks_of_stock: 2.1,
          confidence: 0.78,
          trend: 'seasonal_increasing'
        },
        alcohol_context: {
          abv: 4.5,
          shelf_life_days: 180,
          seasonal_peak: '60 days',
          compliance_notes: []
        },
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
        acknowledged: true,
        resolved: false,
        delivered_via: [],
        metadata: {
          source: 'fallback',
          analysis_id: analysisId || 'demo'
        }
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Loading user context...</p>
      </div>
    )
  }

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
      case 'critical': return 'bg-red-500/10 border-red-500/20'
      case 'high': return 'bg-orange-500/10 border-orange-500/20'
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20'
      case 'low': return 'bg-white/5 border-white/20'
      default: return 'bg-white/5 border-white/20'
    }
  }

  const getSeverityTextColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-white/70'
      default: return 'text-white/70'
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
            <div key={i} className="h-32 bg-white/5 border border-white/20 rounded"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 border border-white/20 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="font-medium text-red-300">Error Loading Alerts</h3>
        </div>
        <p className="text-red-200 mb-3">{error}</p>
        <button 
          onClick={() => {
            fetchRealAlerts()
            fetchRealAlertStats()
          }}
          className="text-red-300 hover:text-red-100 text-sm underline"
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
        <div className="bg-white/5 border border-white/20 rounded p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Alerts</p>
              <p className="text-2xl font-light text-white">
                {alertStats?.totalAlerts || alerts.length}
              </p>
            </div>
            <Bell className="h-8 w-8 text-white/60" />
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-300">Critical Alerts</p>
              <p className="text-2xl font-light text-red-400">
                {alertStats?.criticalAlerts || alerts.filter(a => a.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-300">Resolution Rate</p>
              <p className="text-2xl font-light text-green-400">
                {Math.round(alertStats?.resolutionRate || 0)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-300">Unread Alerts</p>
              <p className="text-2xl font-light text-orange-400">
                {alertStats?.unreadAlerts || alerts.filter(a => !a.acknowledged && !a.resolved).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filter Controls and Alert List */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light text-white">Alerts ({filteredAlerts.length})</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white/10 rounded p-1">
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
                  "px-3 py-2 rounded text-sm font-medium transition-colors",
                  filter === filterOption.key
                    ? "bg-white text-black"
                    : "text-white/60 hover:text-white hover:bg-white/10"
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
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white/5 border border-white/20 rounded-lg p-8 text-center">
            <Bell className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-light text-white mb-2">No Alerts</h3>
            <p className="text-white/60 text-sm">
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
                  "bg-white/5 border rounded-lg p-6 hover:bg-white/8 transition-all",
                  getSeverityBg(alert.severity),
                  !alert.acknowledged && !alert.resolved && "ring-2 ring-white/20"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded flex items-center justify-center",
                      getSeverityBg(alert.severity)
                    )}>
                      <AlertIcon className={cn("h-5 w-5", getSeverityTextColor(alert.severity))} />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-white">{alert.title}</h3>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium uppercase border",
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          alert.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                          alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                          'bg-white/10 text-white/70 border-white/20'
                        )}>
                          {alert.severity}
                        </span>
                        <span className="text-white/50 text-sm">{getTimeAgo(alert.created_at)}</span>
                      </div>
                      
                      <p className="text-white/70 text-sm">{alert.message}</p>
                      
                      <div className="bg-white/5 border border-white/20 rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-4 w-4 text-white/60" />
                          <span className="font-medium text-white text-sm">Recommended Action:</span>
                        </div>
                        <p className="text-white/80 font-medium text-sm">{alert.action_required}</p>
                      </div>
                      
                      {/* Impact Summary */}
                      {(alert.impact.revenue_at_risk || alert.impact.profit_opportunity || alert.impact.time_to_critical) && (
                        <div className="flex items-center space-x-4 text-sm">
                          {alert.impact.revenue_at_risk && alert.impact.revenue_at_risk > 0 && (
                            <span className="text-red-400">Risk: £{alert.impact.revenue_at_risk.toLocaleString()}</span>
                          )}
                          {alert.impact.profit_opportunity && alert.impact.profit_opportunity > 0 && (
                            <span className="text-green-400">Opportunity: £{alert.impact.profit_opportunity.toLocaleString()}</span>
                          )}
                          {alert.impact.time_to_critical && alert.impact.time_to_critical > 0 && (
                            <span className="text-orange-400">{alert.impact.time_to_critical} days to critical</span>
                          )}
                          <span className="text-white/60">Urgency: {alert.impact.urgency}/10</span>
                        </div>
                      )}
                      
                      {/* Alcohol-specific context */}
                      {alert.alcohol_context && (
                        <div className="bg-white/5 border border-white/20 rounded p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-4 w-4 text-white/60" />
                            <span className="font-medium text-white text-sm">Product Details:</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                            {alert.alcohol_context.abv && (
                              <span>ABV: {alert.alcohol_context.abv}%</span>
                            )}
                            {alert.alcohol_context.seasonal_peak && (
                              <span>Peak Season: {alert.alcohol_context.seasonal_peak}</span>
                            )}
                          </div>
                          {alert.alcohol_context.compliance_notes && alert.alcohol_context.compliance_notes.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-white/60 font-medium">Compliance Notes:</p>
                              {alert.alcohol_context.compliance_notes.map((note, idx) => (
                                <p key={idx} className="text-xs text-white/50">• {note}</p>
                              ))}
                            </div>
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
                          className="flex items-center space-x-1 px-3 py-2 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors text-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Acknowledge</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors text-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deleting === alert.id}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                      >
                        {deleting === alert.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
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