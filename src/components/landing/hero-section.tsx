import React from 'react'
import { ArrowRight, Play } from 'lucide-react'

interface HeroSectionProps {
  onBookDemo: () => void
  onWatchDemo: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookDemo, onWatchDemo }) => {
  return (
<div className="min-h-screen flex items-center">
      <section className="relative w-full py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left side - Value proposition (3 columns) */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 border border-white/20 rounded mb-8">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span className="text-white/60 text-sm">AI-powered competitive intelligence</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-light text-white leading-tight mb-8">
                Complete market intelligence
                <br />
                <span className="text-white/60">for your alcohol brand</span>
              </h1>

              <p className="text-base md:text-lg text-white/60 leading-relaxed mb-10 max-w-2xl">
                Monitor competitor prices, track stock levels, and get AI-powered strategic 
                recommendations across 20+ UK retailers. Make data-driven decisions to 
                optimize pricing, distribution, and market share.
              </p>

              <div className="flex items-center gap-4 mb-10">
                <button 
                  onClick={onBookDemo}
                  className="px-6 py-3 bg-white text-black text-sm font-medium rounded hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <span>Book demo</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={onWatchDemo}
                  className="px-6 py-3 border border-white/20 text-white text-sm font-medium rounded hover:border-white/40 transition-colors flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Watch demo</span>
                </button>
              </div>

              <div className="text-sm text-white/40">
                Majestic Wine • Tesco • Waitrose • ASDA • Morrisons • and 15 more
              </div>
            </div>

            {/* Right side - Live example (2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-xs text-white/60 mb-3">Live intelligence dashboard:</div>
              
              {/* Alert feed */}
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-red-300 text-xs font-medium">Price Alert • 2 mins ago</span>
                  </div>
                  <div className="text-white text-xs">Grey Goose 70cl dropped to £24.99 at Tesco</div>
                  <div className="text-white/60 text-xs">Previously £28.50 • 12% decrease</div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse" />
                    <span className="text-orange-300 text-xs font-medium">Stock Alert • 5 mins ago</span>
                  </div>
                  <div className="text-white text-xs">Belvedere 70cl out of stock at Majestic Wine</div>
                  <div className="text-white/60 text-xs">Opportunity detected for premium vodka</div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-300 text-xs font-medium">AI Recommendation • 15 mins ago</span>
                  </div>
                  <div className="text-white text-xs">Lower your gin price by £3 at Waitrose</div>
                  <div className="text-white/60 text-xs">Est. 23% sales increase based on elasticity data</div>
                </div>
              </div>

              {/* Strategic insights */}
              <div className="bg-white/5 border border-white/20 rounded p-4 mt-6">
                <div className="text-xs text-white/60 mb-2">Strategic insights for your brand:</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">Market share opportunity</span>
                    <span className="text-green-400">+£2.1M potential</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">Optimal price point</span>
                    <span className="text-white">£29.99 (vs current £32.99)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">Distribution gaps</span>
                    <span className="text-orange-400">3 high-value retailers</span>
                  </div>
                  <div className="border-t border-white/20 pt-2">
                    <span className="text-white/60 text-xs">Next action: Expand to Morrisons for £180k revenue boost</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}