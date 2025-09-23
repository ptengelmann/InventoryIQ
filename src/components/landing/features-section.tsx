import React from 'react'

interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

interface FeaturesSectionProps {
  features: Feature[]
  scrollY: number
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, scrollY }) => {
  const capabilities = [
    {
      category: "Price Intelligence",
      items: ["Live price tracking", "Competitor analysis", "Price elasticity modeling", "Promotion detection"]
    },
    {
      category: "Stock Monitoring", 
      items: ["Out-of-stock alerts", "Availability tracking", "Distribution gaps", "Shelf-share analysis"]
    },
    {
      category: "Strategic Insights",
      items: ["AI recommendations", "Market positioning", "Revenue optimization", "Growth opportunities"]
    }
  ]

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            Complete competitive intelligence platform
          </h2>
          <p className="text-sm text-white/60">
            Everything alcohol brands need to dominate their market
          </p>
        </div>

        {/* Main capabilities grid with connecting illustration */}
        <div className="relative">
          {/* Connecting lines - hidden on mobile */}
          <div className="hidden md:block absolute inset-0 pointer-events-none">
            {/* Horizontal connecting line */}
            <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-y-1/2"></div>
            
            {/* Flow arrows */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-px bg-white/30"></div>
                <div className="w-0 h-0 border-l-2 border-l-white/30 border-y-2 border-y-transparent"></div>
                <div className="w-2 h-px bg-white/30"></div>
              </div>
            </div>
            
            {/* Data flow indicators */}
            <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse transform -translate-y-1/2" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse transform -translate-y-1/2" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 relative z-10">
            {capabilities.map((capability, idx) => (
              <div key={idx} className="space-y-4 relative">
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center relative">
                      {features[idx] && React.createElement(features[idx].icon, { className: "h-4 w-4 text-white/60" })}
                      {/* Step number overlay */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-black border border-white/30 rounded-full flex items-center justify-center text-xs text-white/80">
                        {idx + 1}
                      </div>
                    </div>
                    <h3 className="text-white font-medium">{capability.category}</h3>
                  </div>
                  
                  {/* Flow indicator for desktop */}
                  {idx < capabilities.length - 1 && (
                    <div className="hidden md:flex items-center">
                      <div className="w-6 h-px bg-white/20"></div>
                      <div className="w-0 h-0 border-l border-l-white/20 border-y border-y-transparent ml-1"></div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {capability.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx}
                      className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded hover:bg-white/8 transition-colors group"
                    >
                      <div className="w-1 h-1 bg-white/40 rounded-full flex-shrink-0 group-hover:bg-white/60 transition-colors"></div>
                      <span className="text-white/70 text-sm group-hover:text-white/80 transition-colors">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration showcase */}
        <div className="border-t border-white/10 pt-16">
          <div className="text-center mb-8">
            <h3 className="text-lg font-light text-white mb-2">Integrates with your existing workflow</h3>
            <p className="text-xs text-white/60">Connect OscarAI to the tools you already use</p>
          </div>
          
          {/* Integration flow illustration */}
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {[
                { name: "Excel/CSV", desc: "Data export" },
                { name: "Slack", desc: "Alerts" },
                { name: "Email", desc: "Reports" },
                { name: "API", desc: "Custom integration" }
              ].map((integration, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded p-4 text-center hover:bg-white/8 transition-colors group">
                  <div className="w-8 h-8 bg-white/10 rounded mx-auto mb-2 group-hover:bg-white/15 transition-colors"></div>
                  <div className="text-white/80 text-sm font-medium">{integration.name}</div>
                  <div className="text-white/50 text-xs">{integration.desc}</div>
                </div>
              ))}
            </div>
            
            {/* Connecting lines between integrations - desktop only */}
            <div className="hidden md:block absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-white/10 via-white/20 to-white/10 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Key differentiator */}
        <div className="mt-16 bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white font-medium mb-4">Why alcohol brands choose OscarAI</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                  <span className="text-white/70 text-sm">Built specifically for alcohol retail</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span className="text-white/70 text-sm">Covers all major UK retailers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="text-white/70 text-sm">AI trained on alcohol market data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                  <span className="text-white/70 text-sm">Enterprise-grade security & compliance</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded p-6">
              <div className="text-center">
                <div className="text-2xl font-light text-white mb-2">20+</div>
                <div className="text-white/60 text-sm mb-4">UK retailers monitored</div>
                <div className="w-full h-px bg-white/10 mb-4"></div>
                <div className="text-xs text-white/50">
                  Majestic Wine • Tesco • Waitrose • ASDA<br />
                  Morrisons • Sainsbury's • and more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}