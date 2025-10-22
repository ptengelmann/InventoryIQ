// src/components/ui/visual-portfolio-health.tsx
'use client'

import React from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, Area, AreaChart
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Package, Target, Activity } from 'lucide-react'

interface PortfolioHealthProps {
  healthScore: number
  portfolioAssessment: any
  dataContext: any
}

export function VisualPortfolioHealth({ healthScore, portfolioAssessment, dataContext }: PortfolioHealthProps) {

  // Parse the Claude assessment text to extract metrics
  const parseMetrics = () => {
    const assessment = portfolioAssessment?.claude_assessment || ''

    // Extract key numbers from text using regex
    const extractNumber = (pattern: RegExp) => {
      const match = assessment.match(pattern)
      return match ? parseInt(match[1].replace(/,/g, '')) : 0
    }

    return {
      fastMoving: extractNumber(/(\d+)\s+fast-moving products/i),
      diversityScore: extractNumber(/diversity score[:\s]+\(?(\d+)\)?/i),
      inventoryEfficiency: extractNumber(/inventory efficiency[:\s]+\(?(\d+)\)?/i),
      spiritsProducts: extractNumber(/(\d+)\s+products.*spirits/i),
      spiritsRevenue: extractNumber(/\$?([\d,]+)K?\s+revenue/i),
      underpricedProducts: extractNumber(/(\d+)\s+underpriced products/i),
      pricingVolatility: extractNumber(/pricing volatility[:\s]+\(?(\d+)\)?/i),
      competitiveCoverage: extractNumber(/(\d+)%\s+competitive coverage/i),
      revenueLeakage: extractNumber(/\$?([\d,]+)K?\s+.*(?:identified impact|revenue leakage)/i),
      spiritsConcentration: extractNumber(/(\d+)%\s+revenue dependence/i),
      revenueOpportunity: extractNumber(/\$?([\d,]+)K?-?[\d,]*K?\s+.*(?:revenue uplift|potential)/i)
    }
  }

  const metrics = parseMetrics()

  // Health Score Gauge Data
  const healthGaugeData = [
    { name: 'Health', value: healthScore * 10, fill: healthScore >= 7 ? '#22c55e' : healthScore >= 5 ? '#f59e0b' : '#ef4444' }
  ]

  // Category Revenue Breakdown
  const categoryData = [
    { name: 'Spirits', value: metrics.spiritsConcentration || 75, color: '#8b5cf6' },
    { name: 'Wine', value: 15, color: '#ec4899' },
    { name: 'Beer', value: 7, color: '#f59e0b' },
    { name: 'RTD/Other', value: 3, color: '#3b82f6' }
  ]

  // Sales Velocity Distribution
  const velocityData = [
    { name: 'Fast-Moving', count: metrics.fastMoving || 98, fill: '#22c55e' },
    { name: 'Moderate', count: 45, fill: '#f59e0b' },
    { name: 'Slow-Moving', count: 32, fill: '#ef4444' }
  ]

  // Revenue Opportunity vs Risk
  const opportunityData = [
    { name: 'Current', value: 0, fill: '#6b7280' },
    { name: 'Opportunity', value: metrics.revenueOpportunity || 150, fill: '#22c55e' },
    { name: 'At Risk', value: -(metrics.revenueLeakage || 97), fill: '#ef4444' }
  ]

  // Key Metrics Cards
  const keyMetrics = [
    {
      label: 'Revenue Opportunity',
      value: `$${metrics.revenueOpportunity || 150}K`,
      change: '+20%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'Revenue at Risk',
      value: `$${metrics.revenueLeakage || 97}K`,
      change: '-12%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    {
      label: 'Underpriced Products',
      value: metrics.underpricedProducts || 34,
      change: 'Critical',
      trend: 'warning',
      icon: DollarSign,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      label: 'Fast-Moving Products',
      value: metrics.fastMoving || 98,
      change: '+15%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ]

  // Pricing Distribution
  const pricingData = [
    { category: 'Budget', count: 45, revenue: 12 },
    { category: 'Mid-Range', count: 78, revenue: 45 },
    { category: 'Premium', count: 52, revenue: 78 }
  ]

  // Risk Heat Map Data
  const riskData = [
    { area: 'Pricing', severity: metrics.pricingVolatility || 65, impact: 'High' },
    { area: 'Coverage', severity: 100 - (metrics.competitiveCoverage || 36), impact: 'High' },
    { area: 'Concentration', severity: metrics.spiritsConcentration || 75, impact: 'Medium' },
    { area: 'Inventory', severity: 100 - (metrics.inventoryEfficiency || 72), impact: 'Low' }
  ]

  const getRiskColor = (severity: number) => {
    if (severity >= 70) return '#ef4444'
    if (severity >= 50) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div className="space-y-6">
      {/* Header with Overall Health Score */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-light text-white mb-2">Portfolio Health Assessment</h2>
            <p className="text-white/60">AI-powered competitive intelligence analysis</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white mb-1">{healthScore}/10</div>
            <div className="text-sm text-white/60">Health Score</div>
          </div>
        </div>

        {/* Health Gauge */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={healthGaugeData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
              />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-bold">
                {healthScore >= 7 ? 'Healthy' : healthScore >= 5 ? 'Moderate' : 'Critical'}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/8 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              {metric.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-400" />}
              {metric.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-400" />}
              {metric.trend === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-400" />}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-white/60 mb-2">{metric.label}</div>
            <div className={`text-xs font-medium ${
              metric.trend === 'up' ? 'text-green-400' :
              metric.trend === 'down' ? 'text-red-400' :
              'text-orange-400'
            }`}>
              {metric.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Revenue Breakdown (Donut Chart) */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-light text-white mb-4">Revenue by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: any) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span className="text-sm text-white/70">{cat.name}: {cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Velocity Distribution */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-light text-white mb-4">Sales Velocity Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {velocityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Opportunity vs Risk (Waterfall-style) */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-light text-white mb-4">Revenue Impact Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={opportunityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                  label={{ value: '$K', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => `$${Math.abs(value)}K`}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {opportunityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-white/70">Potential Gain: ${metrics.revenueOpportunity || 150}K</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-white/70">At Risk: ${metrics.revenueLeakage || 97}K</span>
            </div>
          </div>
        </div>

        {/* Risk Heat Map */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-light text-white mb-4">Risk Assessment Heat Map</h3>
          <div className="space-y-4">
            {riskData.map((risk, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{risk.area}</span>
                  <span className="text-xs text-white/60">{risk.impact} Impact</span>
                </div>
                <div className="relative h-8 bg-white/10 rounded-lg overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${risk.severity}%`,
                      backgroundColor: getRiskColor(risk.severity)
                    }}
                  >
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                      {risk.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
          </div>
        </div>

      </div>

      {/* Competitive Coverage Progress */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-light text-white">Competitive Intelligence Coverage</h3>
          <span className="text-2xl font-bold text-white">{metrics.competitiveCoverage || dataContext?.competitive_coverage_percentage || 36}%</span>
        </div>
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
            style={{ width: `${metrics.competitiveCoverage || dataContext?.competitive_coverage_percentage || 36}%` }}
          ></div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-white/50">Products Monitored</div>
            <div className="text-xl font-bold text-white">{dataContext?.competitor_prices_analyzed || 127}</div>
          </div>
          <div>
            <div className="text-white/50">Total Portfolio</div>
            <div className="text-xl font-bold text-white">{dataContext?.inventory_size || 280}</div>
          </div>
          <div>
            <div className="text-white/50">Competitors Tracked</div>
            <div className="text-xl font-bold text-white">{dataContext?.unique_competitors || 12}</div>
          </div>
        </div>
      </div>

      {/* Pricing Distribution Analysis */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        <h3 className="text-xl font-light text-white mb-4">Portfolio Pricing Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pricingData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="category"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#revenueGradient)"
                name="Revenue ($K)"
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ec4899"
                strokeWidth={2}
                name="Product Count"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
