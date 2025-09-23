    // src/app/reset-password/page.tsx
    'use client'

    import React, { useState, useEffect, Suspense } from 'react'
    import { useRouter, useSearchParams } from 'next/navigation'
    import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'

    function ResetPasswordForm() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [tokenValid, setTokenValid] = useState<boolean | null>(null)
    const [userEmail, setUserEmail] = useState('')

    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
        setError('Invalid reset link. Please request a new password reset.')
        return
        }

        // Verify token on component mount
        verifyToken()
    }, [token])

    const verifyToken = async () => {
        try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            action: 'verify',
            token
            })
        })

        const data = await response.json()

        if (response.ok && data.valid) {
            setTokenValid(true)
            setUserEmail(data.email)
        } else {
            setTokenValid(false)
            setError(data.error || 'Invalid or expired reset link')
        }
        } catch (err) {
        setTokenValid(false)
        setError('Failed to verify reset link')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
        // Validation
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long')
        }

        if (newPassword !== confirmPassword) {
            throw new Error('Passwords do not match')
        }

        // Reset password
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            action: 'reset',
            token,
            newPassword
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to reset password')
        }

        setSuccess(true)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
            router.push('/')
        }, 3000)

        } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
        setIsLoading(false)
        }
    }

    if (tokenValid === null) {
        return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-black border border-white/20 rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Verifying reset link...</p>
            </div>
        </div>
        )
    }

    if (tokenValid === false) {
        return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-black border border-white/20 rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-red-400 text-2xl">⚠</div>
            </div>
            <h1 className="text-xl font-light text-white mb-4">Invalid Reset Link</h1>
            <p className="text-white/60 mb-6">{error}</p>
            <button
                onClick={() => router.push('/')}
                className="bg-white text-black px-6 py-2 rounded hover:bg-gray-100 transition-colors"
            >
                Back to Sign In
            </button>
            </div>
        </div>
        )
    }

    if (success) {
        return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-black border border-white/20 rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <h1 className="text-xl font-light text-white mb-4">Password Reset Successfully</h1>
            <p className="text-white/60 mb-6">
                Your password has been updated. You can now sign in with your new password.
            </p>
            <p className="text-white/50 text-sm">
                Redirecting to sign in page in 3 seconds...
            </p>
            </div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-black border border-white/20 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-light text-white">Reset your password</h1>
            <p className="text-sm text-white/60 mt-2">
                Enter a new password for {userEmail}
            </p>
            </div>

            <div className="p-6 space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            <div>
                <label className="block text-sm text-white/70 mb-2">
                New Password
                </label>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                </div>
            </div>

            <div>
                <label className="block text-sm text-white/70 mb-2">
                Confirm New Password
                </label>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-colors"
                    placeholder="Confirm new password"
                    required
                />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded p-3">
                <p className="text-white/60 text-xs">
                Password requirements:
                </p>
                <ul className="text-white/50 text-xs mt-1 space-y-1">
                <li className={newPassword.length >= 6 ? 'text-green-400' : ''}>
                    • At least 6 characters
                </li>
                <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-400' : ''}>
                    • Passwords match
                </li>
                </ul>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                className="w-full bg-white text-black py-3 rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
                {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating Password...</span>
                </div>
                ) : (
                'Update Password'
                )}
            </button>

            <div className="text-center">
                <button
                type="button"
                onClick={() => router.push('/')}
                className="text-white/60 hover:text-white text-sm"
                >
                Back to sign in
                </button>
            </div>
            </div>
        </div>
        </div>
    )
    }

    export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        }>
        <ResetPasswordForm />
        </Suspense>
    )
    }