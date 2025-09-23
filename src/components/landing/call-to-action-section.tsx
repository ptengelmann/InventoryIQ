import React from 'react'
import { Calendar, ArrowRight, Shield, Users, Zap } from 'lucide-react'

interface CallToActionSectionProps {
  onBookDemo: () => void
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({ onBookDemo }) => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="relative bg-white/5 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-16 shadow-2xl">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Transform Your Brand Intelligence Today
          </h2>
          <p className="text-2xl md:text-3xl text-white/80 mb-12 max-w-4xl mx-auto font-medium">
            Join leading alcohol brands using OscarAI for competitive intelligence, pricing optimization, and market share growth.
          </p>
          
          <button 
            onClick={onBookDemo}
            className="group relative px-16 py-8 bg-white text-black font-bold text-2xl rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/30 transform hover:scale-105 mb-12"
          >
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8" />
              <span>Book Enterprise Demo</span>
              <ArrowRight className="h-8 w-8 group-hover:translate-x-3 transition-transform" />
            </div>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-8 text-white/40">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="text-lg">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span className="text-lg">Dedicated Success</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span className="text-lg">Custom Integration</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}