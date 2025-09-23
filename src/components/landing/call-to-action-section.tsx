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
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Ready to start monitoring your competition?
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join alcohol brands using OscarAI to track competitors, optimize pricing, 
            and identify market opportunities in real-time.
          </p>
          
          <button 
            onClick={onBookDemo}
            className="group px-8 py-4 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors flex items-center space-x-3 mx-auto mb-8"
          >
            <Calendar className="h-5 w-5" />
            <span>Book demo</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center space-x-8 text-white/40 text-xs">
            <span>Enterprise security</span>
            <span>•</span>
            <span>Dedicated support</span>
            <span>•</span>
            <span>Custom integration</span>
          </div>
        </div>
      </div>
    </section>
  )
}