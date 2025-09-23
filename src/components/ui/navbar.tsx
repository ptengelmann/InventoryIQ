'use client'

import React, { useState } from 'react'
import { Menu, X, User, LogOut, ChevronDown, BarChart3, LineChart, Bell, Clock, Target, Users, MapPin, Mail, Wine } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

interface NavbarProps {
  onLogin: () => void
  onSignup: () => void
  onForgotPassword?: () => void  // Optional - only used on landing page
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

  // Different nav items for logged in vs logged out
  const loggedInNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/analytics", label: "Analytics", icon: LineChart },
    { href: "/competitive", label: "Competition", icon: Target },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/history", label: "History", icon: Clock },
  ]

  const loggedOutNavItems = [
    { href: "/about", label: "About", icon: Users },
    { href: "/roadmap", label: "Roadmap", icon: MapPin },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  const currentNavItems = user ? loggedInNavItems : loggedOutNavItems

  const NavLink = ({ href, children, icon: Icon, className = '' }: { 
    href: string, 
    children: React.ReactNode,
    icon?: any,
    className?: string 
  }) => (
    <Link 
      href={href} 
      className={cn(
        "relative flex items-center space-x-2 px-4 py-2 rounded font-medium text-sm transition-all duration-200",
        isActive(href) 
          ? "text-white bg-white/10 border border-white/20" 
          : "text-white/70 hover:text-white hover:bg-white/5",
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  )

  return (
    <nav className="relative bg-black/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <Wine className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-light text-white">OscarAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {currentNavItems.map((item) => (
              <NavLink key={item.href} href={item.href} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              /* Logged In User Menu */
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-white/5 transition-colors"
                >
                  <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white font-medium text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/70 text-sm hidden sm:block">{user.name}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-white/40 transition-transform duration-200",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </button>

                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-black border border-white/20 rounded-lg shadow-xl py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        logout()
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In */
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={onLogin}
                  className="px-4 py-2 text-white/70 hover:text-white font-medium transition-colors text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignup}
                  className="px-4 py-2 bg-white text-black font-medium rounded hover:bg-gray-100 transition-colors text-sm"
                >
                  Book Demo
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded hover:bg-white/5 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-white/70" />
              ) : (
                <Menu className="h-5 w-5 text-white/70" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="space-y-1">
              {currentNavItems.map((item) => (
                <NavLink 
                  key={item.href} 
                  href={item.href} 
                  icon={item.icon}
                  className="block"
                >
                  {item.label}
                </NavLink>
              ))}
              
              {!user && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={onLogin}
                    className="block w-full text-left px-4 py-2 text-white/70 hover:text-white font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignup}
                    className="block w-full bg-white text-black px-4 py-2 rounded font-medium"
                  >
                    Book Demo
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