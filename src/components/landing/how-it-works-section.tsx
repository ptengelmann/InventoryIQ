import React from 'react'
import { CheckCircle } from 'lucide-react'

interface HowItWorksStep {
  step: number
  title: string
  headline: string
  description: string
  features: string[]
  icon: React.ComponentType<{ className?: string }>
}

interface HowItWorksSectionProps {
  steps: HowItWorksStep[]
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ steps }) => {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
            From zero to AI competitive advantage in 15 minutes
          </h2>
          <p className="text-base text-white/70 mb-6">
            While competitors spend weeks on market research, you'll have enterprise-grade intelligence in minutes
          </p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/20 rounded">
            <span className="text-white/60 text-sm">No integrations required • Works with any inventory system</span>
          </div>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={step.step} className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center text-black font-medium text-sm">
                    {step.step}
                  </div>
                  <span className="text-white/80 text-sm">{step.title}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-light text-white">
                  {step.headline}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {step.description}
                </p>
                <div className="space-y-2">
                  {step.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3 text-xs text-white/60">
                      <CheckCircle className="h-3 w-3 text-white/40 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded p-6">
                {step.step === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <step.icon className="h-4 w-4 text-green-400" />
                      <span className="text-white/80 text-sm font-medium">AI Brand Recognition</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                        <span className="text-white/70">Grey Goose 70cl</span>
                        <span className="text-green-400">✓ Identified</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                        <span className="text-white/70">Hendrick's Gin 70cl</span>
                        <span className="text-green-400">✓ Identified</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded text-xs">
                        <span className="text-white/70">Macallan 12yr 70cl</span>
                        <span className="text-green-400">✓ Identified</span>
                      </div>
                    </div>
                    <div className="text-center text-xs text-white/50 mt-3">
                      AI recognizes 98% of alcohol brands automatically
                    </div>
                  </div>
                )}

                {step.step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <step.icon className="h-4 w-4 text-blue-400" />
                      <span className="text-white/80 text-sm font-medium">Live Intelligence Feed</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                        <div className="text-red-300 text-xs font-medium">Price Alert</div>
                        <div className="text-white/70 text-xs">Competitor undercut detected</div>
                      </div>
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="text-green-300 text-xs font-medium">Opportunity</div>
                        <div className="text-white/70 text-xs">Stock gap in premium segment</div>
                      </div>
                      <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                        <div className="text-blue-300 text-xs font-medium">AI Strategy</div>
                        <div className="text-white/70 text-xs">Seasonal campaign generated</div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-white/50 mt-3">
                      Real-time monitoring across 20+ UK retailers
                    </div>
                  </div>
                )}

                {step.step === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <step.icon className="h-4 w-4 text-purple-400" />
                      <span className="text-white/80 text-sm font-medium">Strategic Intelligence</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 border border-white/20 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white/70 text-xs">Portfolio Health Score</span>
                          <span className="text-green-400 text-sm font-medium">8.5/10</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/70 text-xs">Revenue Opportunity</span>
                          <span className="text-white text-sm font-medium">£180k</span>
                        </div>
                      </div>
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="text-green-300 text-xs font-medium">Next Action</div>
                        <div className="text-white/70 text-xs">Launch at Morrisons for £23k boost</div>
                      </div>
                    </div>
                    <div className="text-center text-xs text-white/50 mt-3">
                      AI generates actionable strategies with revenue predictions
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}