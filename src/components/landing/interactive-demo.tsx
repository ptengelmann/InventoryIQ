import React from 'react'
import { Store, Target, PieChart, ArrowRight, Activity, AlertTriangle, TrendingUp, Package, CheckCircle } from 'lucide-react'

interface InteractiveDemoProps {
  animatedNumber: number
  scrollY: number
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ animatedNumber, scrollY }) => {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            Live AI intelligence dashboard
          </h2>
          <p className="text-base text-white/70 mb-4">
            This is what £2M revenue opportunities look like in real-time
          </p>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-400/30 rounded">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-xs">Live data from UK alcohol retailers</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/20 rounded-lg overflow-hidden">
          {/* Simple browser chrome */}
          <div className="bg-white/5 border-b border-white/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span className="text-white/60 font-mono text-xs">oscarai.com/dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-green-400 rounded-full" />
                <span className="text-white/60 text-xs">Live</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* AI Intelligence metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 border border-white/20 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Portfolio Health</span>
                  <Store className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-2xl font-light text-white">{Math.min(animatedNumber/10, 10).toFixed(1)}/10</div>
                <div className="text-green-300 text-xs">AI Health Score</div>
              </div>

              <div className="bg-white/5 border border-white/20 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Revenue Impact</span>
                  <Target className="h-4 w-4 text-orange-400" />
                </div>
                <div className="text-2xl font-light text-white">£{Math.round(animatedNumber * 25)}k</div>
                <div className="text-orange-300 text-xs">Monthly potential</div>
              </div>

              <div className="bg-white/5 border border-white/20 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Competitive Edge</span>
                  <PieChart className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-light text-white">+{Math.round(animatedNumber/7)}%</div>
                <div className="text-blue-300 text-xs">vs market average</div>
              </div>
            </div>

            {/* Enhanced AI intelligence feed */}
            <div className="bg-white/5 border border-white/20 rounded p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-white/60" />
                  <span className="text-white/80 text-sm font-medium">AI Strategic Intelligence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-400/30">
                    Live AI Analysis
                  </div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-red-500/5 rounded border border-red-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                      <span className="text-red-300 text-xs font-medium">Critical Revenue Threat</span>
                    </div>
                    <span className="text-red-200 text-xs">2 mins ago</span>
                  </div>
                  <div className="text-white/80 text-sm font-medium">Grey Goose undercuts you by 12% at Tesco</div>
                  <div className="text-white/60 text-xs">£28.50 → £24.99 • Risk: £47k monthly revenue</div>
                  <div className="text-red-300 text-xs font-medium mt-1">AI Rec: Match price within 48 hours</div>
                </div>

                <div className="p-3 bg-green-500/5 rounded border border-green-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-green-400" />
                      <span className="text-green-300 text-xs font-medium">Revenue Opportunity</span>
                    </div>
                    <span className="text-green-200 text-xs">5 mins ago</span>
                  </div>
                  <div className="text-white/80 text-sm font-medium">Premium vodka gap detected at Majestic</div>
                  <div className="text-white/60 text-xs">Belvedere stock-out in £40-50 segment</div>
                  <div className="text-green-300 text-xs font-medium mt-1">AI Rec: 15% price increase = £23k boost</div>
                </div>

                <div className="p-3 bg-blue-500/5 rounded border border-blue-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Package className="h-3 w-3 text-blue-400" />
                      <span className="text-blue-300 text-xs font-medium">AI Seasonal Strategy</span>
                    </div>
                    <span className="text-blue-200 text-xs">12 mins ago</span>
                  </div>
                  <div className="text-white/80 text-sm font-medium">Summer gin campaign strategy generated</div>
                  <div className="text-white/60 text-xs">Premium segment targeting with 3-phase rollout</div>
                  <div className="text-blue-300 text-xs font-medium mt-1">AI Projection: £180k revenue over 8 weeks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}