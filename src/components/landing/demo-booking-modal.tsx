import React, { useState } from 'react'
import { X } from 'lucide-react'

interface DemoBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Demo booking submitted:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Close modal and show success
    onClose()
    setFormData({ name: '', email: '', company: '', phone: '', message: '' })
    
    // Could trigger success notification here
    alert('Demo booked successfully! We\'ll contact you within 24 hours.')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-12 max-w-3xl w-full shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-8 w-8" />
        </button>
        
        <div className="mb-12">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Book Enterprise Demo</h3>
          <p className="text-xl text-white/80 font-medium">
            Get a personalized demonstration of OscarAI's competitive intelligence platform
          </p>
        </div>

        <div onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-white font-bold text-lg mb-3">Name *</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-lg font-medium backdrop-blur-sm"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-white font-bold text-lg mb-3">Email *</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-lg font-medium backdrop-blur-sm"
                placeholder="work@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-white font-bold text-lg mb-3">Company *</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-lg font-medium backdrop-blur-sm"
                placeholder="Your company name"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-white font-bold text-lg mb-3">Phone</label>
              <input
                type="tel"
                className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-lg font-medium backdrop-blur-sm"
                placeholder="+44 7xxx xxx xxx"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-bold text-lg mb-3">Message</label>
            <textarea
              rows={5}
              className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none text-lg font-medium backdrop-blur-sm"
              placeholder="Tell us about your brand and specific needs..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-white text-black font-bold py-6 rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-2xl transform hover:scale-[1.02] text-xl"
          >
            Schedule Demo Call
          </button>
        </div>

        <p className="text-white/50 text-center mt-8 text-lg">
          We'll contact you within 24 hours to schedule your personalized demo
        </p>
      </div>
    </div>
  )
}