// src/components/ui/action-button.tsx
// ENTERPRISE-GRADE ACTION BUTTON
// Reusable component for executing actions with confirmation and tracking

'use client'

import React, { useState } from 'react'
import { Loader2, Check, AlertTriangle, X, TrendingUp, Package, Zap } from 'lucide-react'

export interface ActionPayload {
  type: 'price_update' | 'reorder_stock' | 'launch_campaign'
  sku_code?: string
  sku_codes?: string[]
  params: any
  reason: string
  expected_impact?: number
  confidence?: number
}

interface ActionButtonProps {
  action: ActionPayload
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  requireConfirmation?: boolean
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  className?: string
  children?: React.ReactNode
}

export function ActionButton({
  action,
  variant = 'primary',
  size = 'md',
  requireConfirmation = true,
  onSuccess,
  onError,
  className = '',
  children
}: ActionButtonProps) {
  const [executing, setExecuting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const getUserEmail = () => {
    // In production, get from context/session
    return 'pedro@inventoryiq.com'
  }

  const executeAction = async () => {
    if (requireConfirmation && !showConfirm) {
      setShowConfirm(true)
      return
    }

    setExecuting(true)
    setResult(null)

    try {
      const response = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId: getUserEmail()
        })
      })

      const data = await response.json()

      if (data.status === 'requires_approval') {
        setResult({
          success: false,
          message: `Approval required: ${data.approval_details.approval_reason}`
        })
        onError?.(data)
      } else if (data.success) {
        setResult({
          success: true,
          message: data.message
        })
        onSuccess?.(data)

        // Auto-hide success message after 3 seconds
        setTimeout(() => setResult(null), 3000)
      } else {
        setResult({
          success: false,
          message: data.error || 'Action failed'
        })
        onError?.(data)
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Action failed'
      })
      onError?.(error)
    } finally {
      setExecuting(false)
      setShowConfirm(false)
    }
  }

  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center rounded font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2'
    }

    const variantStyles = {
      primary: 'bg-white text-black hover:bg-gray-100 border border-white/20',
      secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/20',
      danger: 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
    }

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`
  }

  const getActionIcon = () => {
    switch (action.type) {
      case 'price_update':
        return <TrendingUp className="h-4 w-4" />
      case 'reorder_stock':
        return <Package className="h-4 w-4" />
      case 'launch_campaign':
        return <Zap className="h-4 w-4" />
      default:
        return null
    }
  }

  const getActionLabel = () => {
    if (children) return children

    switch (action.type) {
      case 'price_update':
        return 'Update Price'
      case 'reorder_stock':
        return 'Reorder Stock'
      case 'launch_campaign':
        return 'Launch Campaign'
      default:
        return 'Execute'
    }
  }

  // Show result badge if action completed
  if (result) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm ${
        result.success
          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
          : 'bg-red-500/20 text-red-300 border border-red-500/30'
      }`}>
        {result.success ? (
          <Check className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <span>{result.message}</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={executeAction}
        disabled={executing}
        className={getButtonStyles()}
      >
        {executing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Executing...</span>
          </>
        ) : (
          <>
            {getActionIcon()}
            <span>{getActionLabel()}</span>
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationModal
          action={action}
          onConfirm={executeAction}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}

// Confirmation Modal Component
function ConfirmationModal({
  action,
  onConfirm,
  onCancel
}: {
  action: ActionPayload
  onConfirm: () => void
  onCancel: () => void
}) {

  const getConfirmationDetails = () => {
    switch (action.type) {
      case 'price_update':
        const { sku_code, current_price, new_price } = action.params
        const change = ((new_price - current_price) / current_price * 100).toFixed(1)
        return {
          title: 'Confirm Price Update',
          details: [
            { label: 'SKU', value: sku_code },
            { label: 'Current Price', value: `£${current_price.toFixed(2)}` },
            { label: 'New Price', value: `£${new_price.toFixed(2)}` },
            { label: 'Change', value: `${change > 0 ? '+' : ''}${change}%` }
          ],
          warning: Math.abs(parseFloat(change)) > 15
            ? 'Large price change - verify before proceeding'
            : null
        }

      case 'reorder_stock':
        const { quantity, cost_per_unit, supplier } = action.params
        const total = quantity * cost_per_unit
        return {
          title: 'Confirm Stock Reorder',
          details: [
            { label: 'Quantity', value: `${quantity} units` },
            { label: 'Supplier', value: supplier },
            { label: 'Cost per Unit', value: `£${cost_per_unit.toFixed(2)}` },
            { label: 'Total Cost', value: `£${total.toFixed(2)}` }
          ],
          warning: total > 1000 ? 'Large order - ensure budget available' : null
        }

      case 'launch_campaign':
        const { campaign_name, target_skus, discount_percentage } = action.params
        return {
          title: 'Confirm Campaign Launch',
          details: [
            { label: 'Campaign', value: campaign_name },
            { label: 'Products', value: `${target_skus.length} SKUs` },
            { label: 'Discount', value: `${discount_percentage}%` }
          ],
          warning: null
        }

      default:
        return {
          title: 'Confirm Action',
          details: [],
          warning: null
        }
    }
  }

  const details = getConfirmationDetails()

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 rounded-lg max-w-md w-full p-6 animate-in fade-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-light text-white">{details.title}</h3>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          {details.details.map((detail, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-white/60">{detail.label}:</span>
              <span className="text-white font-medium">{detail.value}</span>
            </div>
          ))}

          {action.reason && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/50 mb-1">Reason:</div>
              <div className="text-sm text-white/80">{action.reason}</div>
            </div>
          )}

          {action.expected_impact && action.expected_impact !== 0 && (
            <div className="mt-2">
              <div className="text-xs text-white/50 mb-1">Expected Impact:</div>
              <div className={`text-sm font-medium ${
                action.expected_impact > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {action.expected_impact > 0 ? '+' : ''}£{action.expected_impact.toFixed(0)}/month
              </div>
            </div>
          )}
        </div>

        {/* Warning */}
        {details.warning && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-300">{details.warning}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-white/10 text-white border border-white/20 rounded hover:bg-white/15 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-white text-black border border-white/20 rounded hover:bg-gray-100 transition-colors font-medium"
          >
            Confirm & Execute
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-white/40 text-center mt-4">
          This action can be rolled back within 24 hours
        </p>
      </div>
    </div>
  )
}
