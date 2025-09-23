import React from 'react'
import { ArrowRight, Play } from 'lucide-react'

interface HeroSectionProps {
  onBookDemo: () => void
  onWatchDemo: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookDemo, onWatchDemo }) => {
  return (
    <div className="bg-black min-h-screen flex items-center">
      <section className="relative w-full py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Minimal status indicator */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 border border-white/20 rounded-full mb-12">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-white/70 text-sm">Live retail data</span>
          </div>

          {/* Clean headline with clear value prop */}
          <div className="space-y-8 mb-16">
            <h1 className="text-4xl md:text-6xl font-light text-white leading-tight tracking-tight">
              Track competitor prices
              <br />
              <span className="text-white/60">across UK alcohol retail</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
              Monitor your alcohol brand's pricing and availability across 
              <br />
              Majestic Wine, Tesco, Waitrose, and 20+ UK retailers.
              <br />
              <span className="text-white/80">Get alerts when competitors change prices.</span>
            </p>
          </div>

          {/* Minimal CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={onBookDemo}
              className="group px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Book demo</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            
            <button 
              onClick={onWatchDemo}
              className="group px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-lg hover:border-white/40 transition-colors duration-200 flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Watch demo</span>
            </button>
          </div>

          {/* Clear value indicators */}
          <div className="flex items-center justify-center space-x-8 text-xs text-white/40">
            <span>Price monitoring</span>
            <span>•</span>
            <span>Stock alerts</span>
            <span>•</span>
            <span>Competitor tracking</span>
          </div>

          {/* Illustrative example */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-left space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Grey Goose 70cl - Tesco</span>
                  <span className="text-white">£28.50</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Your Brand 70cl - Tesco</span>
                  <span className="text-white">£32.00</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-white/70 text-xs">Price change detected 2 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-3">Live example of price monitoring</p>
          </div>
        </div>
      </section>
    </div>
  )
}