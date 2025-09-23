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
            How it works
          </h2>
          <p className="text-sm text-white/60">
            Three simple steps to start monitoring your competition
          </p>
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
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center mx-auto">
                    <step.icon className="h-6 w-6 text-white/60" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-white/80 text-sm">{step.title}</h4>
                    <p className="text-white/40 text-xs">Visual preview</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}