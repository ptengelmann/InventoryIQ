import React from 'react'
import { Calendar, ArrowRight } from 'lucide-react'

interface CallToActionSectionProps {
  onBookDemo: () => void
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ onBookDemo }) => {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white/5 border border-white/20 rounded-lg p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-400/30 rounded mb-6">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 text-sm font-medium">Join brands already gaining competitive advantage</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Stop competing with spreadsheets.<br />
              <span className="text-green-400">Start winning with AI.</span>
            </h2>

            <p className="text-white/70 mb-6 max-w-2xl mx-auto leading-relaxed">
              While your competitors manually track prices, you'll have AI monitoring 20+ retailers,
              predicting revenue impacts, and generating strategies that drive real results.
            </p>

            {/* Value props */}
            <div className="grid grid-cols-3 gap-6 mb-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-xl font-light text-white">£2M+</div>
                <div className="text-xs text-white/60">Revenue detected</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-light text-white">24/7</div>
                <div className="text-xs text-white/60">AI monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-light text-white">15min</div>
                <div className="text-xs text-white/60">Setup time</div>
              </div>
            </div>
          </div>

          <button
            onClick={onBookDemo}
            className="group px-8 py-4 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors flex items-center space-x-3 mx-auto mb-8"
          >
            <Calendar className="h-5 w-5" />
            <span>See AI intelligence in action</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center space-x-8 text-white/50 text-xs">
            <span>✓ Enterprise AI security</span>
            <span>✓ Expert onboarding support</span>
            <span>✓ Custom retailer integration</span>
          </div>
        </div>
      </div>
    </section>
  )
}