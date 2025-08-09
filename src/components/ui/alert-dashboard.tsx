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
  Filter,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Zap,
  Brain,
  Target,
  Bell,
  Calendar,
  Gauge,
  Settings
} from 'lucide-react'
import { AlertEngine, Alert, AlertRule } from '@/lib/alert-engine'
import { cn } from '@/lib/utils'

interface AlertDashboardProps {
  inventoryData?: Array<{
    sku: string
    currentPrice: number
    currentInventory: number
    weeklySales: number
  }>
  onAcknowledge?: (alertId: string) => void
  onResolve?: (alertId: string) => void
}

export function AlertDashboard({ inventoryData = [], onAcknowledge, onResolve }: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'unread'>('all')
  const [showSettings, setShowSettings] = useState(false)

  // Generate mock data if no inventory data provided
  const mockInventoryData = [
    { sku: 'ABC123', currentPrice: 29.99, currentInventory: 12, weeklySales: 30 },
    { sku: 'XYZ789', currentPrice: 15.50, currentInventory: 150, weeklySales: 10 },
    { sku: 'DEF456', currentPrice: 99.00, currentInventory: 8, weeklySales: 20 },
    { sku: 'GHI321', currentPrice: 45.00, currentInventory: 200, weeklySales: 5 },
    { sku: 'JKL654', currentPrice: 12.99, currentInventory: 2, weeklySales: 15 }
  ]

  const activeInventoryData = inventoryData.length > 0 ? inventoryData : mockInventoryData

  // Demo alerts for testing
  const getDemoAlerts = (): Alert[] => [
    {
      id: '1',
      rule_id: 'critical-stockout',
      sku: 'DEF456',
      type: 'stockout',
      severity: 'critical',
      title: 'CRITICAL: DEF456 Stock Critical',
      message: 'Only 0.4 weeks of stock remaining for DEF456. AI predicts stockout in 3 days with 87% confidence.',
      action_required: 'URGENT: Reorder immediately',
      impact: {
        revenue_at_risk: 2400,
        time_to_critical: 3
      },
      data: {
        current_stock: 8,
        predicted_demand: 140,
        weeks_of_stock: 0.4,
        confidence: 0.87,
        trend: 'increasing'
      },
      created_at: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: false,
      resolved: false,
      delivered_via: ['email', 'push']
    },
    {
      id: '2',
      rule_id: 'price-opportunity',
      sku: 'ABC123',
      type: 'price_opportunity',
      severity: 'high',
      title: 'Revenue Opportunity: ABC123',
      message: 'AI identified $1,847 monthly revenue opportunity for ABC123. Price increase recommended with 91% confidence.',
      action_required: 'INCREASE PRICE - Increase to $31.49',
      impact: {
        profit_opportunity: 1847
      },
      data: {
        current_stock: 12,
        predicted_demand: 120,
        weeks_of_stock: 2.4,
        confidence: 0.91,
        trend: 'increasing'
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledged: false,
      resolved: false,
      delivered_via: ['email']
    },
    {
      id: '3',
      rule_id: 'demand-spike',
      sku: 'GHI999',
      type: 'demand_spike',
      severity: 'high',
      title: 'Demand Surge Detected: GHI999',
      message: 'AI predicts 67% demand increase for GHI999. Current inventory may be insufficient for surge.',
      action_required: 'Increase inventory and consider price optimization',
      impact: {
        revenue_at_risk: 890,
        time_to_critical: 12
      },
      data: {
        current_stock: 45,
        predicted_demand: 85,
        weeks_of_stock: 3.2,
        confidence: 0.84,
        trend: 'increasing'
      },
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000),
      acknowledged: true,
      resolved: false,
      delivered_via: ['email', 'push']
    },
    {
      id: '4',
      rule_id: 'overstock-alert',
      sku: 'XYZ789',
      type: 'overstock',
      severity: 'medium',
      title: 'Overstock Alert: XYZ789',
      message: 'XYZ789 has 15.2 weeks of excess inventory. Consider promotional pricing to move 84 units.',
      action_required: 'Create promotion or adjust pricing strategy',
      impact: {
        profit_opportunity: 420
      },
      data: {
        current_stock: 150,
        predicted_demand: 40,
        weeks_of_stock: 15.2,
        confidence: 0.76,
        trend: 'stable'
      },
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
      acknowledged: false,
      resolved: false,
      delivered_via: ['email']
    }
  ]

  useEffect(() => {
    // Initialize alert rules
    const defaultRules = AlertEngine.getDefaultAlertRules()
    setAlertRules(defaultRules)

    // Use demo alerts or generate from inventory data
    if (inventoryData.length > 0) {
      const generatedAlerts = AlertEngine.analyzeAndGenerateAlerts(activeInventoryData, defaultRules)
      setAlerts(generatedAlerts)
    } else {
      setAlerts(getDemoAlerts())
    }
    setLoading(false)
  }, [inventoryData])

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'critical':
        return alert.severity === 'critical'
      case 'high':
        return alert.severity === 'high' || alert.severity === 'critical'
      case 'unread':
        return !alert.acknowledged
      default:
        return true
    }
  })

  const alertSummary = AlertEngine.generateAlertSummary(alerts)
  const insights = AlertEngine.generateInsights(alerts)

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
    onAcknowledge?.(alertId)
  }

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    onResolve?.(alertId)
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500 to-pink-500'
      case 'high':
        return 'from-orange-500 to-red-500'
      case 'medium':
        return 'from-yellow-500 to-orange-500'
      case 'low':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
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

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
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
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
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
              <Gauge className="h-6 w-6 text-orange-600" />
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

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Smart Alerts</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
            {[
              { key: 'all', label: 'All', count: alerts.length },
              { key: 'critical', label: 'Critical', count: alertSummary.critical_alerts },
              { key: 'high', label: 'High', count: alertSummary.high_priority_alerts },
              { key: 'unread', label: 'Unread', count: alerts.filter(a => !a.acknowledged).length }
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
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

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
            
            return (
              <div
                key={alert.id}
                className={cn(
                  "bg-white rounded-xl p-6 border-l-4 shadow-sm hover:shadow-md transition-all",
                  getSeverityBg(alert.severity),
                  !alert.acknowledged && "ring-2 ring-blue-100"
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
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
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
                              <span>⚠️ Risk: ${alert.impact.revenue_at_risk.toLocaleString()}</span>
                            </div>
                          )}
                          {alert.impact.profit_opportunity && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <span>💰 Opportunity: ${alert.impact.profit_opportunity.toLocaleString()}</span>
                            </div>
                          )}
                          {alert.impact.time_to_critical && (
                            <div className="flex items-center space-x-1 text-orange-600">
                              <span>⏰ {alert.impact.time_to_critical} days to critical</span>
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
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Additional AI Insights Summary */}
      {filteredAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
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
              💡 <strong>Pro Tip:</strong> Address critical alerts first to prevent stockouts. 
              Revenue opportunities can typically be implemented within 24-48 hours for maximum impact.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}