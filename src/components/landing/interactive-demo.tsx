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
            Live dashboard preview
          </h2>
          <p className="text-sm text-white/60">
            See what alcohol brand managers see in real-time
          </p>
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
            {/* Key metrics - simplified */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 border border-white/20 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Coverage</span>
                  <Store className="h-4 w-4 text-white/40" />
                </div>
                <div className="text-2xl font-light text-white">{animatedNumber}%</div>
                <div className="text-white/60 text-xs">UK retailers</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Position</span>
                  <Target className="h-4 w-4 text-white/40" />
                </div>
                <div className="text-2xl font-light text-white">+12%</div>
                <div className="text-white/60 text-xs">vs average</div>
              </div>

              <div className="bg-white/5 border border-white/20 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Share</span>
                  <PieChart className="h-4 w-4 text-white/40" />
                </div>
                <div className="text-2xl font-light text-white">15.2%</div>
                <div className="text-white/60 text-xs">premium segment</div>
              </div>
            </div>

            {/* Live feed - simplified */}
            <div className="bg-white/5 border border-white/20 rounded p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-4 w-4 text-white/60" />
                <span className="text-white/80 text-sm">Live intelligence</span>
                <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-400/30">
                  Real-time
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-500/5 rounded border border-red-400/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-sm">Grey Goose price dropped 8% at Tesco</span>
                  </div>
                  <span className="text-red-300 text-xs">2m</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-500/5 rounded border border-orange-400/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-sm">Belvedere out of stock at Majestic</span>
                  </div>
                  <span className="text-orange-300 text-xs">5m</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-500/5 rounded border border-green-400/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-sm">Recommendation: Lower price by £2 at Waitrose</span>
                  </div>
                  <span className="text-green-300 text-xs">12m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}