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
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogin={handleLogin} onSignup={handleSignup} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to home if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
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
            <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto">
              <UserCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-black">Access Required</h2>
            <p className="text-gray-600">Please sign in to view your profile settings.</p>
            <button
              onClick={handleLogin}
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Account Settings</span>
            </div>

            <h1 className="text-4xl font-bold text-black">Profile Settings</h1>
            <p className="text-xl text-gray-600">Manage your account and preferences</p>
          </div>

          {/* Save Status Banner */}
          {saveStatus !== 'idle' && (
            <div className={`p-4 rounded-lg flex items-center space-x-3 border ${
              saveStatus === 'success' ? 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-400'
            }`}>
              {saveStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-black" />
              ) : (
                <AlertCircle className="h-5 w-5 text-black" />
              )}
              <span className="text-black font-medium">
                {saveStatus === 'success' ? 'Changes saved successfully!' : errorMessage}
              </span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white border-2 border-gray-200 rounded-lg">
            <div className="border-b-2 border-gray-200">
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
                    className={`py-4 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 ${
                      activeTab === key
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
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
                      <div className="w-24 h-24 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-black transition-colors">
                        <Camera className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-black">{user.name}</h2>
                      <p className="text-gray-600 text-lg">{user.email}</p>
                      <p className="text-gray-500">{user.company}</p>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={isEditing ? formData.name : user.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={user.email}
                          disabled={true}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="company"
                          value={isEditing ? formData.company || '' : user.company || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-black mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={isEditing ? formData.phone || '' : user.phone || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-black mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="location"
                          value={isEditing ? formData.location || '' : user.location || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500 font-medium"
                          placeholder="City, State, Country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
                    <div className="text-sm text-gray-500 font-medium">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-6 py-3 text-black border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-semibold"
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
                          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
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
                    <h3 className="text-2xl font-bold text-black">Notification Preferences</h3>
                    {settingsLoading && (
                      <Loader className="h-5 w-5 animate-spin text-black" />
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-bold text-black">Email Notifications</h4>
                        <p className="text-gray-600">Receive email alerts for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={userSettings.email_alerts}
                          onChange={(e) => handleSettingChange('email_alerts', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-bold text-black">Competitive Monitoring</h4>
                        <p className="text-gray-600">Monitor competitor pricing changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={userSettings.competitive_monitoring}
                          onChange={(e) => handleSettingChange('competitive_monitoring', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-black">
                        Alert Frequency
                      </label>
                      <select
                        value={userSettings.alert_frequency}
                        onChange={(e) => handleSettingChange('alert_frequency', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black font-medium"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Summary</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">
                          Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          value={userSettings.stock_alert_threshold}
                          onChange={(e) => handleSettingChange('stock_alert_threshold', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black font-medium"
                          min="0"
                          max="100"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-medium">Units remaining to trigger alert</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-black mb-2">
                          Price Change Threshold (%)
                        </label>
                        <input
                          type="number"
                          value={userSettings.price_change_threshold}
                          onChange={(e) => handleSettingChange('price_change_threshold', parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black font-medium"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-medium">Price change % to trigger alert</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-gray-200">
                    <button
                      onClick={saveUserSettings}
                      disabled={settingsLoading}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-semibold"
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
                  <h3 className="text-2xl font-bold text-black">Billing & Subscription</h3>
                  
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-black">Free Trial</h4>
                        <p className="text-gray-600 font-medium">14 days remaining</p>
                      </div>
                      <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-black">Billing History</h4>
                    <div className="text-center py-12 border-2 border-gray-200 rounded-lg bg-gray-50">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-black font-medium">No billing history yet</p>
                      <p className="text-sm text-gray-500 font-medium">Your first bill will appear here after your trial ends</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-black">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-black">Change Password</h4>
                          <p className="text-gray-600">Update your password regularly for security</p>
                        </div>
                        <button className="px-4 py-2 text-black border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-semibold">
                          Change Password
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-black">Two-Factor Authentication</h4>
                          <p className="text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-black">API Keys</h4>
                          <p className="text-gray-600">Manage API access for integrations</p>
                        </div>
                        <button className="px-4 py-2 text-black border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-semibold">
                          Manage Keys
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-2 border-red-300 rounded-lg p-6 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-red-900">Delete Account</h4>
                          <p className="text-red-700">Permanently delete your account and all data</p>
                        </div>
                        <button className="inline-flex items-center space-x-2 px-4 py-2 text-red-700 border-2 border-red-300 rounded-lg hover:bg-red-100 transition-colors font-semibold">
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