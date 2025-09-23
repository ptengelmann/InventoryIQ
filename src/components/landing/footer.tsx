import React from 'react'
import { Wine } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/10 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <Wine className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-light text-white">OscarAI</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Competitive intelligence for alcohol brands. Monitor pricing, track competitors, 
              and optimize your market strategy with AI.
            </p>
          </div>

          <div>
            <h4 className="text-white/80 text-sm font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-white/60">
              <li><a href="/dashboard" className="hover:text-white transition-colors text-sm">Dashboard</a></li>
              <li><a href="/analytics" className="hover:text-white transition-colors text-sm">Analytics</a></li>
              <li><a href="/competitive" className="hover:text-white transition-colors text-sm">Competition</a></li>
              <li><a href="/alerts" className="hover:text-white transition-colors text-sm">Alerts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white/80 text-sm font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors text-sm">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-sm">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-white/40 text-xs">
              <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors">Security</a>
            </div>
            <p className="text-white/40 text-xs">
              © 2025 OscarAI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}