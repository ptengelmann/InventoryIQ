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
              <div className="inline-flex items-center space-x-2 px-3 py-1 border border-green-400/30 bg-green-500/10 rounded mb-8">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 text-sm font-medium">Powered by Advanced AI • Enterprise-grade intelligence</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-light text-white leading-tight mb-8">
                The AI giving alcohol brands
                <br />
                <span className="text-green-400">an unfair advantage</span>
              </h1>

              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-6 max-w-2xl">
                Get strategic insights, revenue predictions, and competitive intelligence that turn
                every pricing decision into profit. Built specifically for UK alcohol retail.
              </p>

              {/* Social proof metrics */}
              <div className="grid grid-cols-3 gap-6 mb-10 max-w-lg">
                <div className="text-center">
                  <div className="text-2xl font-light text-white">£2M+</div>
                  <div className="text-xs text-white/60">Revenue opportunities detected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-white">20+</div>
                  <div className="text-xs text-white/60">UK retailers monitored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-white">47</div>
                  <div className="text-xs text-white/60">AI strategies generated</div>
                </div>
              </div>

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

              <div className="text-sm text-white/50">
                <span className="text-white/60">Trusted by alcohol brands monitoring:</span>
                <br />
                Majestic Wine • Tesco • Waitrose • ASDA • Morrisons • and 15 more
              </div>
            </div>

            {/* Right side - Live example (2 columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-xs text-white/60 mb-3 flex items-center space-x-2">
                <span>AI Strategic Intelligence:</span>
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">LIVE</span>
              </div>

              {/* Enhanced alert feed with revenue impact */}
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                      <span className="text-red-300 text-xs font-medium">Critical Threat</span>
                    </div>
                    <span className="text-red-200 text-xs">2 mins ago</span>
                  </div>
                  <div className="text-white text-xs font-medium">Grey Goose undercuts you by 12% at Tesco</div>
                  <div className="text-white/60 text-xs">£28.50 → £24.99 • Risk: £47k monthly revenue</div>
                  <div className="text-red-300 text-xs font-medium mt-1">Recommend: Match price within 48 hours</div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-300 text-xs font-medium">Revenue Opportunity</span>
                    </div>
                    <span className="text-green-200 text-xs">5 mins ago</span>
                  </div>
                  <div className="text-white text-xs font-medium">Belvedere out of stock at Majestic Wine</div>
                  <div className="text-white/60 text-xs">Gap detected in £40-50 premium vodka segment</div>
                  <div className="text-green-300 text-xs font-medium mt-1">Opportunity: £23k increase with 15% price boost</div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-300 text-xs font-medium">AI Strategy</span>
                    </div>
                    <span className="text-blue-200 text-xs">12 mins ago</span>
                  </div>
                  <div className="text-white text-xs font-medium">Seasonal gin promotion strategy generated</div>
                  <div className="text-white/60 text-xs">Summer campaign targeting premium segment</div>
                  <div className="text-blue-300 text-xs font-medium mt-1">Projected: £180k revenue boost over 8 weeks</div>
                </div>
              </div>

              {/* Enhanced strategic insights with AI branding */}
              <div className="bg-white/5 border border-white/20 rounded p-4 mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="text-xs text-white/60">AI Portfolio Assessment:</div>
                  <div className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                    8.5/10 Health Score
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">Untapped market opportunity</span>
                    <span className="text-green-400 font-medium">£2.1M potential</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">AI-recommended price optimization</span>
                    <span className="text-white">£29.99 (-9% current)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70">Distribution expansion targets</span>
                    <span className="text-orange-400">3 high-ROI retailers</span>
                  </div>
                  <div className="border-t border-white/20 pt-2 mt-3">
                    <div className="text-white/70 text-xs font-medium mb-1">Next Strategic Action:</div>
                    <span className="text-green-300 text-xs">Launch at Morrisons for £180k revenue boost</span>
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