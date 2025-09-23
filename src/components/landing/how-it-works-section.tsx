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
    <section className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
            How Leading Alcohol Brands Use OscarAI
          </h2>
          <p className="text-2xl md:text-3xl text-white/80 max-w-4xl mx-auto font-medium">
            From upload to insights in three simple steps - built for brand teams
          </p>
        </div>

        <div className="space-y-32">
          {steps.map((step, index) => (
            <div 
              key={step.step} 
              className={`grid lg:grid-cols-2 gap-16 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
            >
              <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black font-bold text-2xl shadow-2xl">
                    {step.step}
                  </div>
                  <span className="text-2xl font-bold text-white">{step.title}</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white">
                  {step.headline}
                </h3>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-medium">
                  {step.description}
                </p>
                <div className="space-y-4">
                  {step.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                      <CheckCircle className="h-6 w-6 text-white flex-shrink-0" />
                      <span className="text-white font-semibold text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-12 hover:bg-white/15 transition-all duration-500 transform hover:scale-105 shadow-2xl">
                  <div className="text-center space-y-8">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                      <step.icon className="h-12 w-12 text-black" />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-white text-2xl">{step.title}</h4>
                      <p className="text-white/70 text-lg">Interactive visualization placeholder</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements for visual interest */}
                <div className={`absolute -top-4 ${index % 2 === 0 ? '-right-4' : '-left-4'} w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA after how it works */}
        <div className="text-center mt-24 pt-16 border-t-2 border-white/20">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to optimize your brand performance?
          </h3>
          <p className="text-xl md:text-2xl text-white/70 mb-12 font-medium">
            Join leading alcohol brands using OscarAI for competitive intelligence
          </p>
        </div>
      </div>
    </section>
  )
}