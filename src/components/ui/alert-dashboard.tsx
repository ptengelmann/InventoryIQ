// UPDATE EXISTING: /components/ui/alert-dashboard.tsx
// Enhanced AlertDashboard with delete and management features

'use client'

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Clock,
  CheckCircle,
  X,
  Bell,
  Settings,
  Brain,
  Zap,
  Target,
  RefreshCw,
  Trash2,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react'
import { AlertEngine, Alert } from '@/lib/alert-engine'
import { cn } from '@/lib/utils'

interface AlertDashboardProps {
  analysisId?: string
  onAcknowledge?: (alertId: string) => void
  onResolve?: (alertId: string) => void
  onDelete?: (alertId: string) => void
}

export function AlertDashboard({ analysisId, onAcknowledge, onResolve, onDelete }: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'unread'>('all')
  const [showSettings, setShowSettings] = useState(false)
  const [showManagement, setShowManagement] = useState(false)
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const [batchLoading, setBatchLoading] = useState(false)

  // Fetch alerts from API
  useEffect(() => {
    fetchAlerts()
  }, [analysisId])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const endpoint = analysisId 
        ? `/api/alerts/${analysisId}`
        : '/api/alerts/latest'
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch alerts')
      }
      
      setAlerts(data.alerts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    // Filter out resolved alerts unless specifically viewing them
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

  const alertSummary = AlertEngine.generateAlertSummary(alerts.filter(a => !a.resolved))
  const insights = AlertEngine.generateInsights(alerts.filter(a => !a.resolved))

  const handleAcknowledge = async (alertId: string) => {
    try {
      const targetAnalysisId = analysisId || alerts.find(a => a.id === alertId)?.id?.split('-')[2]
      if (!targetAnalysisId) return
      
      const response = await fetch(`/api/alerts/${targetAnalysisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'acknowledge' })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ))
        onAcknowledge?.(alertId)
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      const targetAnalysisId = analysisId || alerts.find(a => a.id === alertId)?.id?.split('-')[2]
      if (!targetAnalysisId) return
      
      const response = await fetch(`/api/alerts/${targetAnalysisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'resolve' })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true, acknowledged: true } : alert
        ))
        onResolve?.(alertId)
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const handleDelete = async (alertId: string) => {
    try {
      setDeleting(alertId)
      const targetAnalysisId = analysisId || alerts.find(a => a.id === alertId)?.id?.split('-')[2]
      if (!targetAnalysisId) return
      
      const response = await fetch(`/api/alerts/${targetAnalysisId}?alertId=${alertId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        setSelectedAlerts(prev => prev.filter(id => id !== alertId))
        onDelete?.(alertId)
      }
    } catch (error) {
      console.error('Failed to delete alert:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleBatchOperation = async (operation: 'acknowledge_all' | 'resolve_all' | 'delete_selected') => {
    if (selectedAlerts.length === 0) return
    
    try {
      setBatchLoading(true)
      const targetAnalysisId = analysisId || alerts[0]?.id?.split('-')[2]
      if (!targetAnalysisId) return
      
      const response = await fetch(`/api/alerts/${targetAnalysisId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, alertIds: selectedAlerts })
      })
      
      if (response.ok) {
        if (operation === 'delete_selected') {
          setAlerts(prev => prev.filter(alert => !selectedAlerts.includes(alert.id)))
        } else {
          setAlerts(prev => prev.map(alert => {
            if (selectedAlerts.includes(alert.id)) {
              return operation === 'acknowledge_all' 
                ? { ...alert, acknowledged: true }
                : { ...alert, resolved: true, acknowledged: true }
            }
            return alert
          }))
        }
        setSelectedAlerts([])
      }
    } catch (error) {
      console.error('Failed to perform batch operation:', error)
    } finally {
      setBatchLoading(false)
    }
  }

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      setSelectedAlerts(prev => [...prev, alertId])
    } else {
      setSelectedAlerts(prev => prev.filter(id => id !== alertId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(filteredAlerts.map(alert => alert.id))
    } else {
      setSelectedAlerts([])
    }
  }

  const getSeverityBg = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'high':
        return 'bg-orange-50 border-orange-200'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200'
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getSeverityTextColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'stockout':
        return Package
      case 'overstock':
        return Package
      case 'price_opportunity':
        return DollarSign
      case 'demand_spike':
        return TrendingUp
      case 'trend_change':
        return Target
      default:
        return AlertTriangle
    }
  }

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const alertDate = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-900">Error Loading Alerts</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchAlerts}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  // No alerts state
  if (alerts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Alert Summary Cards - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue at Risk</p>
                <p className="text-2xl font-bold text-orange-600">$0</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit Opportunity</p>
                <p className="text-2xl font-bold text-green-600">$0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No Alerts Available</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {analysisId 
              ? "This analysis doesn't have any smart alerts yet. Alerts are generated when our AI detects risks or opportunities."
              : "Smart alerts will appear here once you upload and analyze your inventory data. Our AI will monitor for stockouts, pricing opportunities, and risk factors."
            }
          </p>
          <button
            onClick={() => window.location.href = '/analytics'}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Package className="h-5 w-5" />
            <span>Upload Inventory Data</span>
          </button>
        </div>
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
              <p className="text-2xl font-bold text-gray-900">{alertSummary.total_alerts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{alertSummary.critical_alerts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue at Risk</p>
              <p className="text-2xl font-bold text-orange-600">
                ${alertSummary.total_revenue_at_risk?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profit Opportunity</p>
              <p className="text-2xl font-bold text-green-600">
                ${alertSummary.total_profit_opportunity?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <p key={index} className="text-gray-700">{insight}</p>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls with Batch Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Smart Alerts</h2>
        <div className="flex items-center space-x-2">
          {/* Batch Actions */}
          {selectedAlerts.length > 0 && (
            <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-sm text-blue-700 font-medium">
                {selectedAlerts.length} selected
              </span>
              <button
                onClick={() => handleBatchOperation('acknowledge_all')}
                disabled={batchLoading}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Acknowledge All
              </button>
              <button
                onClick={() => handleBatchOperation('resolve_all')}
                disabled={batchLoading}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
              >
                Resolve All
              </button>
              <button
                onClick={() => handleBatchOperation('delete_selected')}
                disabled={batchLoading}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
            {[
              { key: 'all', label: 'All', count: alerts.filter(a => !a.resolved).length },
              { key: 'critical', label: 'Critical', count: alertSummary.critical_alerts },
              { key: 'high', label: 'High', count: alertSummary.high_priority_alerts },
              { key: 'unread', label: 'Unread', count: alerts.filter(a => !a.acknowledged && !a.resolved).length }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                  filter === filterOption.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {filterOption.label}
                {filterOption.count > 0 && (
                  <span className={cn(
                    "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                    filter === filterOption.key
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  )}>
                    {filterOption.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={fetchAlerts}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setShowManagement(!showManagement)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Management options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Management Panel */}
      {showManagement && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Management</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete ALL alerts for this analysis?')) {
                  // Handle delete all alerts
                  const targetAnalysisId = analysisId || alerts[0]?.id?.split('-')[2]
                  if (targetAnalysisId) {
                    fetch(`/api/alerts/${targetAnalysisId}?deleteAll=true`, { method: 'DELETE' })
                      .then(() => {
                        setAlerts([])
                        setShowManagement(false)
                      })
                  }
                }
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete All Alerts</span>
            </button>
            <span className="text-gray-500 text-sm">
              This will permanently delete all alerts for this analysis
            </span>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      {filteredAlerts.length > 0 && (
        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
          <button
            onClick={() => handleSelectAll(selectedAlerts.length !== filteredAlerts.length)}
            className="flex items-center space-x-2"
          >
            {selectedAlerts.length === filteredAlerts.length ? (
              <CheckSquare className="h-5 w-5 text-blue-600" />
            ) : selectedAlerts.length > 0 ? (
              <div className="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm" />
              </div>
            ) : (
              <Square className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">
              {selectedAlerts.length === filteredAlerts.length 
                ? 'Deselect All' 
                : selectedAlerts.length > 0 
                  ? `${selectedAlerts.length} of ${filteredAlerts.length} selected`
                  : 'Select All'
              }
            </span>
          </button>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts</h3>
            <p className="text-gray-600">All clear! Your inventory is running smoothly.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const AlertIcon = getAlertIcon(alert.type)
            const isSelected = selectedAlerts.includes(alert.id)
            
            return (
              <div
                key={alert.id}
                className={cn(
                  "bg-white rounded-xl p-6 border-l-4 shadow-sm hover:shadow-md transition-all",
                  getSeverityBg(alert.severity),
                  !alert.acknowledged && !alert.resolved && "ring-2 ring-blue-100",
                  alert.resolved && "opacity-60",
                  isSelected && "ring-2 ring-blue-400"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => handleSelectAlert(alert.id, !isSelected)}
                      className="mt-1"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      getSeverityBg(alert.severity)
                    )}>
                      <AlertIcon className={cn("h-5 w-5", getSeverityTextColor(alert.severity))} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {alert.title}
                          {alert.resolved && <span className="text-green-600 text-sm ml-2">(Resolved)</span>}
                        </h3>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium uppercase",
                          getSeverityBg(alert.severity),
                          getSeverityTextColor(alert.severity)
                        )}>
                          {alert.severity}
                        </span>
                        <div className="flex items-center space-x-1 text-gray-500 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{getTimeAgo(alert.created_at)}</span>
                        </div>
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
                            <div className="flex items-center space-x-1 text-red-600">
                              <span>Risk: ${alert.impact.revenue_at_risk.toLocaleString()}</span>
                            </div>
                          )}
                          {alert.impact.profit_opportunity && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <span>Opportunity: ${alert.impact.profit_opportunity.toLocaleString()}</span>
                            </div>
                          )}
                          {alert.impact.time_to_critical && (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <span>{alert.impact.time_to_critical} days to critical</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Data Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-xs text-gray-600">Current Stock</div>
                          <div className="font-semibold text-gray-900">{alert.data.current_stock}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-xs text-gray-600">Weeks of Stock</div>
                          <div className="font-semibold text-gray-900">{alert.data.weeks_of_stock}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-xs text-gray-600">AI Confidence</div>
                          <div className="font-semibold text-gray-900">{Math.round(alert.data.confidence * 100)}%</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-200">
                          <div className="text-xs text-gray-600">Trend</div>
                          <div className={cn(
                            "font-semibold capitalize",
                            alert.data.trend === 'increasing' ? 'text-green-600' : 
                            alert.data.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                          )}>
                            {alert.data.trend}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {!alert.resolved && (
                    <div className="flex items-center space-x-2 ml-4">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Acknowledge</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <X className="h-4 w-4" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        disabled={deleting === alert.id}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
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

      {/* Performance Summary */}
      {filteredAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{alertSummary.critical_alerts}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${alertSummary.total_profit_opportunity?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Revenue Opportunity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${alertSummary.total_revenue_at_risk?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Revenue at Risk</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-gray-700 text-sm">
              <strong>Pro Tip:</strong> Address critical alerts first to prevent stockouts. 
              Revenue opportunities can typically be implemented within 24-48 hours for maximum impact.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}