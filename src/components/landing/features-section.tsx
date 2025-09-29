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
      category: "AI Strategic Advisory",
      items: ["Revenue impact predictions", "Competitive threat analysis", "Market positioning intelligence", "Portfolio health scoring (1-10)"]
    },
    {
      category: "Real-time Market Warfare",
      items: ["Live competitor price monitoring", "Stock-out opportunity alerts", "Promotional pressure detection", "Distribution gap analysis"]
    },
    {
      category: "Revenue Optimization Engine",
      items: ["AI-generated seasonal strategies", "Price elasticity modeling", "Market share opportunity detection", "Profit maximization algorithms"]
    }
  ]

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            Enterprise AI built for alcohol retail warfare
          </h2>
          <p className="text-base text-white/70 mb-6">
            Get McKinsey-level strategic intelligence for the price of a Netflix subscription
          </p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/20 rounded">
            <span className="text-white/60 text-sm">Powered by the same AI that serves Fortune 500 companies</span>
          </div>
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

        {/* Key differentiator with enhanced positioning */}
        <div className="mt-16 bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white font-medium mb-2">The unfair advantage alcohol brands need</h3>
              <p className="text-white/60 text-sm mb-6">While competitors use spreadsheets, you get AI-powered market warfare</p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-2" style={{animationDelay: '0s'}}></div>
                  <div>
                    <div className="text-white/80 text-sm font-medium">Enterprise AI trained on alcohol market data</div>
                    <div className="text-white/50 text-xs">Same technology used by Fortune 500 companies</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-2" style={{animationDelay: '0.5s'}}></div>
                  <div>
                    <div className="text-white/80 text-sm font-medium">Real-time competitive warfare intelligence</div>
                    <div className="text-white/50 text-xs">Know your competitors' moves before they cost you sales</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-2" style={{animationDelay: '1s'}}></div>
                  <div>
                    <div className="text-white/80 text-sm font-medium">Revenue predictions with £ precision</div>
                    <div className="text-white/50 text-xs">See exact impact of every pricing decision before you make it</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mt-2" style={{animationDelay: '1.5s'}}></div>
                  <div>
                    <div className="text-white/80 text-sm font-medium">McKinsey-level strategic intelligence</div>
                    <div className="text-white/50 text-xs">Get consultant-quality insights for a fraction of the cost</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded p-6">
              <div className="text-center space-y-6">
                <div>
                  <div className="text-3xl font-light text-white mb-2">£2M+</div>
                  <div className="text-white/60 text-sm">Revenue opportunities detected</div>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-light text-white">20+</div>
                    <div className="text-white/60 text-xs">UK retailers</div>
                  </div>
                  <div>
                    <div className="text-xl font-light text-white">24/7</div>
                    <div className="text-white/60 text-xs">Live monitoring</div>
                  </div>
                </div>
                <div className="w-full h-px bg-white/10"></div>
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