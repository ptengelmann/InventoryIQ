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
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Enterprise Intelligence
          </h2>
          <p className="text-xl text-white/60 font-medium">
            Built for alcohol brand teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="group relative p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-700 transform hover:scale-105"
              style={{
                transform: `translateY(${scrollY * -0.02 * (idx + 1)}px) scale(${1 + (scrollY * 0.0001)})`
              }}
            >
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <feature.icon className="h-6 w-6 text-white/80" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}