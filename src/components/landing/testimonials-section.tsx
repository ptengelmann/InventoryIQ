import React from 'react'
import { Star } from 'lucide-react'

interface Testimonial {
  quote: string
  author: string
  title: string
  avatar: string
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
  currentTestimonial: number
  setCurrentTestimonial: (index: number) => void
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ 
  testimonials, 
  currentTestimonial, 
  setCurrentTestimonial 
}) => {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-6">
            What brand teams are saying
          </h2>
          <div className="flex items-center justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Testimonial selector cards */}
          <div className="space-y-3">
            {testimonials.map((testimonial, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-full text-left p-4 rounded border transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-white/10 border-white/30 text-white' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/8 hover:text-white/80'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white font-medium text-xs">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{testimonial.author}</p>
                    <p className="text-xs opacity-70">{testimonial.title.split(',')[0]}</p>
                  </div>
                </div>
                <div className="w-8 h-px bg-current opacity-20 mb-2"></div>
                <p className="text-xs leading-relaxed">
                  {testimonial.quote.substring(0, 60)}...
                </p>
              </button>
            ))}
          </div>

          {/* Featured testimonial */}
          <div className="md:col-span-2 bg-white/5 border border-white/20 rounded-lg p-8">
            <div className="mb-6">
              <div className="w-12 h-px bg-white/20 mb-4"></div>
              <p className="text-white text-lg leading-relaxed italic">
                "{testimonials[currentTestimonial]?.quote}"
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center text-white font-medium">
                  {testimonials[currentTestimonial]?.avatar}
                </div>
                <div>
                  <p className="text-white font-medium">{testimonials[currentTestimonial]?.author}</p>
                  <p className="text-white/60 text-sm">{testimonials[currentTestimonial]?.title}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-px h-4 bg-white/20"></div>
                <div className="flex space-x-1">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-4 rounded-full transition-all duration-300 ${
                        index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}