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
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Trusted by Leading Alcohol Brands</h2>
          <div className="flex items-center justify-center space-x-2 mb-12">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
            ))}
            <span className="ml-4 text-white/80 font-bold text-xl">Feedback from brand teams</span>
          </div>
        </div>

        <div className="relative bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-12 shadow-2xl">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-black text-3xl font-bold">"</span>
            </div>
          </div>
          
          <div className="text-center space-y-12">
            <p className="text-2xl md:text-3xl text-white leading-relaxed italic font-medium">
              {testimonials[currentTestimonial]?.quote}
            </p>
            
            <div className="flex items-center justify-center space-x-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm">
                {testimonials[currentTestimonial]?.avatar}
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-2xl">{testimonials[currentTestimonial]?.author}</p>
                <p className="text-white/70 text-xl">{testimonials[currentTestimonial]?.title}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mt-12">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-white scale-125' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}