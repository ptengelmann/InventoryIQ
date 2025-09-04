'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, Menu, X, User, LogOut, History, Settings, ChevronDown, Bell, LineChart, Zap, Clock, Shield, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Target, Grape, Wine } from 'lucide-react'

interface NavbarProps {
  onLogin: () => void
  onSignup: () => void
}

export function Navbar({ onLogin, onSignup }: NavbarProps) {
  const { user, logout } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false)
    }
    
    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const isActive = (path: string) => pathname === path

  const NavLink = ({ href, children, icon: Icon, className = '' }: { 
    href: string, 
    children: React.ReactNode,
    icon?: any,
    className?: string 
  }) => (
    <Link 
      href={href} 
      className={cn(
        "relative flex items-center space-x-2 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-300 group",
        isActive(href) 
          ? "text-white bg-gradient-to-r from-amber-500 to-purple-600 shadow-lg shadow-amber-500/25" 
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
        className
      )}
    >
      {Icon && (
        <Icon className={cn(
          "h-4 w-4 transition-all duration-300",
          isActive(href) ? "text-white" : "text-slate-500 group-hover:text-amber-500"
        )} />
      )}
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      {isActive(href) && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-600/20 rounded-xl blur-sm" />
      )}
    </Link>
  )

  return (
    <nav className="relative bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-50/30 via-transparent to-purple-50/30" />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4 shrink-0">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-500/30">
                  <Grape className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 via-amber-600 to-purple-600 bg-clip-text text-transparent">
                  RolloAI
                </h1>
                <p className="text-xs text-purple-600 font-medium tracking-wide">Alcohol Commerce AI</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            {/* Industry Badge - moved here for better spacing */}
            <div className="hidden xl:flex items-center space-x-6">
              <div className="relative overflow-hidden">
                <span className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-purple-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200/50 shadow-sm whitespace-nowrap">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <span>For Alcohol Brands</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-purple-200/20 rounded-full blur-sm" />
              </div>
              
              <div className="flex items-center space-x-1 bg-slate-50/80 rounded-2xl p-1.5 border border-slate-200/50">
                <NavLink href="/dashboard" icon={BarChart3}>Dashboard</NavLink>
                <NavLink href="/analytics" icon={LineChart}>Analytics</NavLink>
                <NavLink href="/competitive" icon={Target}>Competitive Intel</NavLink>
                <NavLink href="/alerts" icon={Bell}>Alerts</NavLink>
                <NavLink href="/history" icon={Clock}>History</NavLink>
                <NavLink href="/integrations" icon={Zap}>Integrations</NavLink>
              </div>
            </div>
            
            {/* Compact nav for lg-xl screens */}
            <div className="flex xl:hidden items-center space-x-1 bg-slate-50/80 rounded-2xl p-1.5 border border-slate-200/50">
              <NavLink href="/dashboard" icon={BarChart3}>Dashboard</NavLink>
              <NavLink href="/analytics" icon={LineChart}>Analytics</NavLink>
              <NavLink href="/competitive" icon={Target}>Intel</NavLink>
              <NavLink href="/alerts" icon={Bell}>Alerts</NavLink>
              <NavLink href="/history" icon={Clock}>History</NavLink>
              <NavLink href="/integrations" icon={Zap}>Apps</NavLink>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            {user ? (
              /* Logged In User Menu */
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-slate-50/80 transition-all duration-300 group border border-transparent hover:border-slate-200/50"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105">
                      <span className="text-white text-sm font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-amber-600 font-medium">{user.email}</p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-slate-400 transition-all duration-300 group-hover:text-slate-600",
                    isUserMenuOpen && "rotate-180 text-slate-600"
                  )} />
                </button>

                {/* Enhanced User Dropdown */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 py-3 z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-purple-50/30" />
                    
                    <div className="relative px-6 py-3 border-b border-slate-100">
                      <p className="text-xs text-amber-600 font-semibold tracking-wide uppercase">Alcohol Commerce AI</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Shield className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">TTB Compliant</span>
                      </div>
                    </div>
                    
                    <div className="relative py-2">
                      <Link 
                        href="/profile" 
                        className="flex items-center space-x-3 px-6 py-3 text-sm text-slate-700 hover:bg-slate-50/80 transition-all duration-200 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                          <User className="h-4 w-4 text-slate-500 group-hover:text-amber-600" />
                        </div>
                        <span className="font-medium">Profile Settings</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center space-x-3 px-6 py-3 text-sm text-slate-700 hover:bg-slate-50/80 transition-all duration-200 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <Settings className="h-4 w-4 text-slate-500 group-hover:text-purple-600" />
                        </div>
                        <span className="font-medium">Account Settings</span>
                      </Link>
                    </div>
                    
                    <div className="relative px-3 pt-2 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setIsUserMenuOpen(false)
                          logout()
                        }}
                        className="flex items-center space-x-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50/80 w-full text-left transition-all duration-200 rounded-xl group"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <LogOut className="h-4 w-4 text-red-500" />
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In */
              <div className="flex items-center space-x-3">
                <button
                  onClick={onLogin}
                  className="px-3 py-2 text-slate-700 hover:text-slate-900 font-semibold transition-all duration-300 rounded-xl hover:bg-slate-50/80 border border-transparent hover:border-slate-200/50 text-sm whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignup}
                  className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 hover:from-amber-600 hover:to-purple-700 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 group text-sm whitespace-nowrap"
                >
                  <span className="relative z-10">Start Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            )}

            {/* Enhanced Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 rounded-xl hover:bg-slate-50/80 transition-all duration-300 border border-transparent hover:border-slate-200/50"
            >
              <div className="relative w-5 h-5">
                <Menu className={cn(
                  "h-5 w-5 text-slate-600 absolute inset-0 transition-all duration-300",
                  isMobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                )} />
                <X className={cn(
                  "h-5 w-5 text-slate-600 absolute inset-0 transition-all duration-300",
                  isMobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/50 py-6 bg-slate-50/30 backdrop-blur-sm">
            <div className="space-y-2">
              <NavLink href="/dashboard" icon={BarChart3} className="mx-2">Dashboard</NavLink>
              <NavLink href="/analytics" icon={LineChart} className="mx-2">Analytics</NavLink>
              <NavLink href="/competitive" icon={Target} className="mx-2">Competitive Intel</NavLink>
              <NavLink href="/alerts" icon={Bell} className="mx-2">Alerts</NavLink>
              <NavLink href="/history" icon={Clock} className="mx-2">History</NavLink>
              <NavLink href="/integrations" icon={Zap} className="mx-2">Integrations</NavLink>
              
              {!user && (
                <div className="pt-4 border-t border-slate-200/50 space-y-3 px-2">
                  <button
                    onClick={onLogin}
                    className="block w-full text-left px-4 py-3 text-slate-700 hover:text-slate-900 font-semibold hover:bg-slate-50/80 rounded-xl transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignup}
                    className="block w-full bg-gradient-to-r from-amber-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-amber-500/25"
                  >
                    Start Free Trial
                  </button>
                </div>
              )}
              
              {user && (
                <div className="pt-4 border-t border-slate-200/50 px-2">
                  <div className="flex items-center space-x-2 px-4 py-3 mb-3 bg-green-50/80 rounded-xl border border-green-200/50">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">TTB Compliant</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setIsMobileMenuOpen(false)
                      logout()
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 w-full text-left transition-all duration-200 rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}