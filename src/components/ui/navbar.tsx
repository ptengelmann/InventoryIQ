'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, Menu, X, User, LogOut, History, Settings, ChevronDown, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

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

  const NavLink = ({ href, children, className = '' }: { 
    href: string, 
    children: React.ReactNode, 
    className?: string 
  }) => (
    <Link 
      href={href} 
      className={cn(
        "font-medium transition-colors",
        isActive(href) 
          ? "text-blue-600" 
          : "text-gray-700 hover:text-blue-600",
        className
      )}
    >
      {children}
    </Link>
  )

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  InventoryIQ
                </h1>
                <p className="text-xs text-gray-500 font-medium">AI-Powered Optimization</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/analytics">Analytics</NavLink>
            <NavLink href="/alerts" className="flex items-center space-x-1">
              <Bell className="h-4 w-4" />
              <span>Alerts</span>
            </NavLink>
            <NavLink href="/history">History</NavLink>
            <NavLink href="/integrations">Integrations</NavLink>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* Logged In User Menu */
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-gray-500 transition-transform",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      href="/alerts" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Bell className="h-4 w-4" />
                      <span>Alert Management</span>
                    </Link>
                    <Link 
                      href="/history" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <History className="h-4 w-4" />
                      <span>Analysis History</span>
                    </Link>
                    <Link 
                      href="/settings" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setIsUserMenuOpen(false)
                        logout()
                      }}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In */
              <div className="flex items-center space-x-3">
                <button
                  onClick={onLogin}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignup}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              <NavLink href="/dashboard" className="block px-3 py-2">
                Dashboard
              </NavLink>
              <NavLink href="/analytics" className="block px-3 py-2">
                Analytics
              </NavLink>
              <NavLink href="/alerts" className="flex items-center space-x-2 px-3 py-2">
                <Bell className="h-4 w-4" />
                <span>Alerts</span>
              </NavLink>
              <NavLink href="/history" className="block px-3 py-2">
                History
              </NavLink>
              <NavLink href="/integrations" className="block px-3 py-2">
                Integrations
              </NavLink>
              
              {!user && (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    onClick={onLogin}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignup}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-medium"
                  >
                    Get Started
                  </button>
                </div>
              )}
              
              {user && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setIsMobileMenuOpen(false)
                      logout()
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
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