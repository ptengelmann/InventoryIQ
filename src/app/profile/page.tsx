'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { AuthModal } from '@/components/ui/auth-modals'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Bell, 
  Shield, 
  CreditCard,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader,
  Settings,
  UserCircle
} from 'lucide-react'

interface UserSettings {
  email_alerts: boolean
  alert_frequency: string
  competitive_monitoring: boolean
  stock_alert_threshold: number
  price_change_threshold: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, isLoading } = useUser()
  
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user || { name: '', email: '' })
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // User settings state
  const [userSettings, setUserSettings] = useState<UserSettings>({
    email_alerts: true,
    alert_frequency: 'immediate',
    competitive_monitoring: true,
    stock_alert_threshold: 2,
    price_change_threshold: 10.0
  })
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Load user settings when user changes or notifications tab is accessed
  React.useEffect(() => {
    if (user && activeTab === 'notifications' && !settingsLoading) {
      loadUserSettings()
    }
  }, [user, activeTab])

  // Update formData when user changes
  React.useEffect(() => {
    if (user) {
      setFormData(user)
    }
  }, [user])

  const loadUserSettings = async () => {
    if (!user) return
    
    setSettingsLoading(true)
    try {
      const response = await fetch(`/api/users/settings?email=${user.email}`)
      const data = await response.json()
      
      if (data.success && data.settings) {
        setUserSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleSignup = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = (userData: any) => {
    setUser({ ...userData })
    setAuthModalOpen(false)
  }

  const handleLogout = () => {
    router.push('/')
  }

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: formData.name,
          company: formData.company,
          phone: formData.phone,
          location: formData.location
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUser(data.user)
        setFormData(data.user)
        setSaveStatus('success')
        setIsEditing(false)
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setErrorMessage(data.error || 'Failed to save profile')
      }
    } catch (error) {
      setSaveStatus('error')
      setErrorMessage('Network error - please try again')
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(user || { name: '', email: '' })
    setIsEditing(false)
    setSaveStatus('idle')
    setErrorMessage('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveUserSettings = async () => {
    if (!user) return
    
    setSettingsLoading(true)
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          ...userSettings
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setErrorMessage('Failed to save settings')
      }
    } catch (error) {
      setSaveStatus('error')
      setErrorMessage('Network error - please try again')
      console.error('Settings save failed:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to home if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onSwitchMode={switchAuthMode}
          onSuccess={handleAuthSuccess}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-white/10 rounded flex items-center justify-center mx-auto">
              <UserCircle className="h-8 w-8 text-white/60" />
            </div>
            <h2 className="text-3xl font-light text-white">Access Required</h2>
            <p className="text-white/60">Please sign in to view your profile settings.</p>
            <button
              onClick={handleLogin}
              className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar onLogin={handleLogin} onSignup={handleSignup} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 border border-white/20 rounded">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-white/60 text-sm">Account management</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-light text-white leading-tight">
              Profile settings
              <br />
              <span className="text-white/60">manage your account</span>
            </h1>
          </div>

          {/* Save Status Banner */}
          {saveStatus !== 'idle' && (
            <div className={`p-4 rounded-lg flex items-center space-x-3 border ${
              saveStatus === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
            }`}>
              {saveStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span className={`font-medium ${saveStatus === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                {saveStatus === 'success' ? 'Changes saved successfully!' : errorMessage}
              </span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white/5 border border-white/20 rounded-lg">
            <div className="border-b border-white/10">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'profile', label: 'Profile', icon: User },
                  { key: 'notifications', label: 'Notifications', icon: Bell },
                  { key: 'billing', label: 'Billing', icon: CreditCard },
                  { key: 'security', label: 'Security', icon: Shield }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === key
                        ? 'border-white text-white'
                        : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/30'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-white/10 rounded flex items-center justify-center">
                        <span className="text-white text-2xl font-light">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/20 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Camera className="h-4 w-4 text-white/80" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-3xl font-light text-white">{user.name}</h2>
                      <p className="text-white/60 text-lg">{user.email}</p>
                      <p className="text-white/50">{user.company}</p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          type="text"
                          name="name"
                          value={isEditing ? formData.name : user.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none disabled:bg-white/5 disabled:text-white/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          type="email"
                          name="email"
                          value={user.email}
                          disabled={true}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded text-white/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          type="text"
                          name="company"
                          value={isEditing ? formData.company || '' : user.company || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none disabled:bg-white/5 disabled:text-white/50"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          type="tel"
                          name="phone"
                          value={isEditing ? formData.phone || '' : user.phone || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none disabled:bg-white/5 disabled:text-white/50"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                        <input
                          type="text"
                          name="location"
                          value={isEditing ? formData.location || '' : user.location || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none disabled:bg-white/5 disabled:text-white/50"
                          placeholder="City, State, Country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="text-sm text-white/50 font-medium">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-6 py-3 text-white border border-white/20 rounded hover:bg-white/5 transition-colors disabled:opacity-50 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
                          >
                            {saving ? (
                              <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors font-medium"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-light text-white">Notification Preferences</h3>
                    {settingsLoading && (
                      <Loader className="h-5 w-5 animate-spin text-white/60" />
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-white/20 rounded bg-white/5">
                      <div>
                        <h4 className="font-medium text-white">Email Notifications</h4>
                        <p className="text-white/60">Receive email alerts for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={userSettings.email_alerts}
                          onChange={(e) => handleSettingChange('email_alerts', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-white/20 rounded bg-white/5">
                      <div>
                        <h4 className="font-medium text-white">Competitive Monitoring</h4>
                        <p className="text-white/60">Monitor competitor pricing changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={userSettings.competitive_monitoring}
                          onChange={(e) => handleSettingChange('competitive_monitoring', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-white/80">
                        Alert Frequency
                      </label>
                      <select
                        value={userSettings.alert_frequency}
                        onChange={(e) => handleSettingChange('alert_frequency', e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Summary</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          value={userSettings.stock_alert_threshold}
                          onChange={(e) => handleSettingChange('stock_alert_threshold', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-white/50 mt-1">Units remaining to trigger alert</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Price Change Threshold (%)
                        </label>
                        <input
                          type="number"
                          value={userSettings.price_change_threshold}
                          onChange={(e) => handleSettingChange('price_change_threshold', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <p className="text-xs text-white/50 mt-1">Price change % to trigger alert</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      onClick={saveUserSettings}
                      disabled={settingsLoading}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
                    >
                      {settingsLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>{settingsLoading ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-light text-white">Billing & Subscription</h3>
                  
                  <div className="bg-white/5 border border-white/20 rounded-lg p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-medium text-white">Free Trial</h4>
                        <p className="text-white/60">14 days remaining</p>
                      </div>
                      <button className="px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors font-medium">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Billing History</h4>
                    <div className="text-center py-12 border border-white/20 rounded-lg bg-white/5">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-white/40" />
                      <p className="text-white font-medium">No billing history yet</p>
                      <p className="text-sm text-white/50">Your first bill will appear here after your trial ends</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-light text-white">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-white/20 rounded-lg p-6 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Change Password</h4>
                          <p className="text-white/60">Update your password regularly for security</p>
                        </div>
                        <button className="px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-colors font-medium">
                          Change Password
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-white/20 rounded-lg p-6 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                          <p className="text-white/60">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 bg-white text-black rounded hover:bg-gray-100 transition-colors font-medium">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-white/20 rounded-lg p-6 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">API Keys</h4>
                          <p className="text-white/60">Manage API access for integrations</p>
                        </div>
                        <button className="px-4 py-2 text-white border border-white/20 rounded hover:bg-white/5 transition-colors font-medium">
                          Manage Keys
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-red-500/30 rounded-lg p-6 bg-red-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-300">Delete Account</h4>
                          <p className="text-red-200">Permanently delete your account and all data</p>
                        </div>
                        <button className="inline-flex items-center space-x-2 px-4 py-2 text-red-300 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors font-medium">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}