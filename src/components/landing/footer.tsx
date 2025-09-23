import React from 'react'
import { Wine } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t-2 border-white/20 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <Wine className="h-7 w-7 text-black" />
              </div>
              <span className="text-3xl font-bold text-white">OscarAI</span>
              <span className="px-4 py-2 bg-white/10 text-white text-lg font-bold rounded-2xl backdrop-blur-sm">Enterprise</span>
            </div>
            <p className="text-white/70 mb-8 max-w-lg text-lg font-medium leading-relaxed">
              Enterprise competitive intelligence for alcohol brands. Monitor your performance 
              across UK retail, optimize pricing strategies, and maximize market share with AI-powered insights.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xl mb-6">Platform</h4>
            <ul className="space-y-4 text-white/70 font-medium">
              <li><a href="/dashboard" className="hover:text-white transition-colors text-lg">Brand Dashboard</a></li>
              <li><a href="/analytics" className="hover:text-white transition-colors text-lg">Market Intelligence</a></li>
              <li><a href="/competitive" className="hover:text-white transition-colors text-lg">Competitive Analysis</a></li>
              <li><a href="/alerts" className="hover:text-white transition-colors text-lg">Real-Time Alerts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xl mb-6">Company</h4>
            <ul className="space-y-4 text-white/70 font-medium">
              <li><a href="#" className="hover:text-white transition-colors text-lg">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Case Studies</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Enterprise Sales</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-lg">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-white/20 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <div className="flex items-center space-x-12 text-white/60 font-medium text-lg">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-white/40 text-lg">
              © 2025 OscarAI. All rights reserved. Enterprise competitive intelligence for the alcohol industry.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}