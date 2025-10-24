'use client'

import React, { useState } from 'react'
import { Menu, X, User, LogOut, ChevronDown, BarChart3, LineChart, Bell, Clock, Target, Users, MapPin, Mail, Wine, Activity, Zap, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

interface NavbarProps {
  onLogin: () => void
  onSignup: () => void
  onForgotPassword?: () => void
}

export function Navbar({ onLogin, onSignup, onForgotPassword }: NavbarProps) {
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

  // Navigation items with better organization
  const loggedInNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/analytics", label: "Analytics", icon: Activity },
    { href: "/competitive", label: "Intelligence", icon: Target },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/history", label: "History", icon: Clock },
  ]

  const loggedOutNavItems = [
    { href: "/features", label: "Features", icon: Target },
    { href: "/integrations", label: "Integrations", icon: Zap },
    { href: "/pricing", label: "Pricing", icon: Users },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  const currentNavItems = user ? loggedInNavItems : loggedOutNavItems

  const NavLink = ({ href, children, icon: Icon, className = '' }: { 
    href: string, 
    children: React.ReactNode,
    icon?: any,
    className?: string 
  }) => {
    const active = isActive(href)
    
    return (
      <Link 
        href={href} 
        className={cn(
          "group relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 overflow-hidden",
          active 
            ? "text-white bg-white/10" 
            : "text-white/70 hover:text-white hover:bg-white/5",
          className
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Active indicator */}
        <div className={cn(
          "absolute inset-0 bg-white/5 transform transition-transform duration-300",
          active ? "scale-100" : "scale-0 group-hover:scale-100"
        )} />
        
        {/* Content */}
        <div className="relative flex items-center space-x-2">
          {Icon && (
            <Icon className={cn(
              "h-4 w-4 transition-colors duration-200",
              active ? "text-white" : "text-white/60 group-hover:text-white/80"
            )} />
          )}
          <span>{children}</span>
        </div>
        
        {/* Active border */}
        {active && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Backdrop blur for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <nav className="relative bg-black/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-200">
                <Wine className="h-5 w-5 text-black" />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-white rounded-lg opacity-20 group-hover:opacity-30 blur-sm transition-opacity duration-200" />
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-light text-white">OscarAI</span>
                <span className="text-xs text-white/40 font-mono">v2.1</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {currentNavItems.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon}>
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                /* Logged In User Menu */
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-medium text-sm group-hover:bg-white/30 transition-colors duration-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-white text-sm font-medium">{user.name}</span>
                      <span className="text-white/50 text-xs">{user.company || 'Personal'}</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-white/40 transition-all duration-300 group-hover:text-white/60",
                      isUserMenuOpen && "rotate-180"
                    )} />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      
                      {/* Dropdown Menu */}
                      <div 
                        className="absolute right-0 mt-3 w-64 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.name}</div>
                              <div className="text-white/50 text-sm">{user.email}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Menu Items */}
                        <div className="py-2">
                          <Link 
                            href="/profile" 
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>Profile Settings</span>
                          </Link>
                          
                          <Link 
                            href="/dashboard" 
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </div>
                        
                        <div className="border-t border-white/10 py-2">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              logout()
                            }}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Not Logged In */
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={onLogin}
                    className="px-4 py-2 text-white/70 hover:text-white font-medium transition-colors duration-200 text-sm rounded-lg hover:bg-white/5"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignup}
                    className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Book Demo
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
              >
                <div className="relative w-5 h-5">
                  <div className={cn(
                    "absolute inset-0 transition-all duration-300",
                    isMobileMenuOpen ? "rotate-45 opacity-0" : "rotate-0 opacity-100"
                  )}>
                    <Menu className="h-5 w-5 text-white/70" />
                  </div>
                  <div className={cn(
                    "absolute inset-0 transition-all duration-300",
                    isMobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-45 opacity-0"
                  )}>
                    <X className="h-5 w-5 text-white/70" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 z-50",
          isMobileMenuOpen 
            ? "opacity-100 translate-y-0 visible" 
            : "opacity-0 -translate-y-4 invisible"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Navigation Links */}
            <div className="space-y-1 mb-6">
              {currentNavItems.map((item, index) => (
                <div
                  key={item.href}
                  className={cn(
                    "transform transition-all duration-300",
                    isMobileMenuOpen 
                      ? "translate-x-0 opacity-100" 
                      : "translate-x-4 opacity-0"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <NavLink 
                    href={item.href} 
                    icon={item.icon}
                    className="w-full justify-start py-3"
                  >
                    {item.label}
                  </NavLink>
                </div>
              ))}
            </div>
            
            {/* Auth Buttons for Mobile */}
            {!user && (
              <div className={cn(
                "pt-6 border-t border-white/10 space-y-3 transform transition-all duration-300",
                isMobileMenuOpen 
                  ? "translate-x-0 opacity-100" 
                  : "translate-x-4 opacity-0"
              )}
              style={{ transitionDelay: `${currentNavItems.length * 50 + 100}ms` }}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    onLogin()
                  }}
                  className="block w-full text-left px-4 py-3 text-white/70 hover:text-white font-medium rounded-lg hover:bg-white/5 transition-colors duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    onSignup()
                  }}
                  className="block w-full bg-white text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  Book Demo
                </button>
              </div>
            )}
            
            {/* User Actions for Mobile */}
            {user && (
              <div className={cn(
                "pt-6 border-t border-white/10 transform transition-all duration-300",
                isMobileMenuOpen 
                  ? "translate-x-0 opacity-100" 
                  : "translate-x-4 opacity-0"
              )}
              style={{ transitionDelay: `${currentNavItems.length * 50 + 100}ms` }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-white/50 text-sm">{user.email}</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      logout()
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}