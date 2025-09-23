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
      <div className="relative bg-black border border-white/20 rounded-lg p-8 max-w-lg w-full">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-8">
          <h3 className="text-2xl font-light text-white mb-2">Book demo</h3>
          <p className="text-sm text-white/60">
            Get a personalized demonstration of pricing monitoring
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-xs mb-2">Name</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none text-sm transition-colors"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-white/70 text-xs mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none text-sm transition-colors"
                placeholder="work@company.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-xs mb-2">Company</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none text-sm transition-colors"
              placeholder="Your company"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-xs mb-2">Phone (optional)</label>
            <input
              type="tel"
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none text-sm transition-colors"
              placeholder="+44 7xxx xxx xxx"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs mb-2">Message (optional)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none text-sm resize-none transition-colors"
              placeholder="Tell us about your needs..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-white text-black font-medium py-2 rounded hover:bg-gray-100 transition-colors text-sm"
          >
            Schedule demo
          </button>
        </div>

        <p className="text-white/40 text-center mt-4 text-xs">
          We'll contact you within 24 hours
        </p>
      </div>
    </div>
  )
}