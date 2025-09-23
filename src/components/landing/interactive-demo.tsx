import React from 'react'
import { Store, Target, PieChart, ArrowRight, Activity, AlertTriangle, TrendingUp, Package, CheckCircle } from 'lucide-react'

interface InteractiveDemoProps {
  animatedNumber: number
  scrollY: number
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ animatedNumber, scrollY }) => {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-8xl mx-auto">
        <div 
          className="relative bg-white/5 backdrop-blur-2xl border-2 border-white/20 rounded-3xl overflow-hidden shadow-2xl"
          style={{
            transform: `translateY(${scrollY * -0.05}px)`
          }}
        >
          {/* Browser chrome with enhanced contrast */}
          <div className="bg-white/10 border-b-2 border-white/20 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg" />
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg" />
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg" />
                </div>
                <span className="ml-6 text-white/90 font-mono text-lg">OscarAI Enterprise - AU Vodka Brand Intelligence</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                <span className="text-white font-bold text-lg">Live Data</span>
              </div>
            </div>
          </div>

          <div className="p-12">
            {/* Key metrics with enhanced visibility */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-xl">Retail Coverage</h3>
                  <Store className="h-8 w-8 text-white/80" />
                </div>
                <div className="text-6xl font-bold text-white mb-4">{animatedNumber}%</div>
                <div className="text-white/80 text-lg font-medium">UK Premium Off-Trade</div>
                <div className="mt-4 flex items-center space-x-3 text-white/70">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Majestic, Waitrose, Tesco, ASDA</span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-xl">Price Position</h3>
                  <Target className="h-8 w-8 text-white/80" />
                </div>
                <div className="text-6xl font-bold text-white mb-4">+12%</div>
                <div className="text-white/80 text-lg font-medium">vs Category Average</div>
                <div className="mt-4 flex items-center space-x-3 text-white/70">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Premium positioning</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-xl">Market Share</h3>
                  <PieChart className="h-8 w-8 text-white/80" />
                </div>
                <div className="text-6xl font-bold text-white mb-4">15.2%</div>
                <div className="text-white/80 text-lg font-medium">Premium Vodka Segment</div>
                <div className="mt-4 flex items-center space-x-3 text-white/70">
                  <ArrowRight className="h-5 w-5" />
                  <span className="font-medium">+2.1% vs last quarter</span>
                </div>
              </div>
            </div>

            {/* Live competitive intelligence feed */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
              <h4 className="text-white font-bold text-2xl mb-6 flex items-center space-x-3">
                <Activity className="h-7 w-7 text-white" />
                <span>Live Competitive Intelligence</span>
                <span className="px-4 py-2 bg-green-500/20 text-green-300 text-lg rounded-2xl font-bold border border-green-400/30">Real-time</span>
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-red-500/10 rounded-2xl border border-red-400/30">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                    <span className="text-white font-semibold text-lg">Grey Goose increased price 8% at Waitrose</span>
                  </div>
                  <span className="text-red-300 text-lg font-bold">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/20">
                  <div className="flex items-center space-x-4">
                    <TrendingUp className="h-7 w-7 text-white/80" />
                    <span className="text-white font-semibold text-lg">AU Vodka now #2 in premium vodka at Tesco</span>
                  </div>
                  <span className="text-white/70 text-lg font-bold">1 hour ago</span>
                </div>
                <div className="flex items-center justify-between p-6 bg-green-500/10 rounded-2xl border border-green-400/30">
                  <div className="flex items-center space-x-4">
                    <Package className="h-7 w-7 text-green-400" />
                    <span className="text-white font-semibold text-lg">Belvedere out of stock at 3 Majestic locations</span>
                  </div>
                  <span className="text-green-300 text-lg font-bold">3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}