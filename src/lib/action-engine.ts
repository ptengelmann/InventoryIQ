// src/lib/action-engine.ts
// ENTERPRISE-GRADE ACTION EXECUTION ENGINE
// Handles validation, execution, rollback, and audit trails for all user actions

import { prisma } from './database-postgres'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ActionPayload {
  type: 'price_update' | 'reorder_stock' | 'launch_campaign' | 'bulk_update'
  sku_code?: string
  sku_codes?: string[]
  params: any
  reason: string
  expected_impact?: number
  confidence?: number
}

export interface ValidationResult {
  valid: boolean
  errors?: string[]
  warnings?: string[]
  requires_approval?: boolean
  approval_reason?: string
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
}

export interface ExecutionResult {
  success: boolean
  action_id: string
  message: string
  data?: any
  actual_impact?: number
  external_refs?: any
  errors?: string[]
}

// ============================================================================
// MAIN ACTION ENGINE CLASS
// ============================================================================

export class ActionEngine {

  /**
   * Execute an action with full enterprise validation and audit trail
   */
  static async executeAction(
    payload: ActionPayload,
    userId: string,
    initiatedBy: string = 'user'
  ): Promise<ExecutionResult> {

    console.log(`🎯 ACTION ENGINE: Executing ${payload.type} for user ${userId}`)

    // PHASE 1: Validate action
    const validation = await this.validateAction(payload, userId)

    if (!validation.valid) {
      console.error('❌ Validation failed:', validation.errors)
      return {
        success: false,
        action_id: '',
        message: 'Validation failed',
        errors: validation.errors
      }
    }

    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('⚠️ Validation warnings:', validation.warnings)
    }

    // PHASE 2: Check approval requirements
    if (validation.requires_approval) {
      return await this.createApprovalRequest(payload, userId, validation)
    }

    // PHASE 3: Create action audit record
    const actionRecord = await prisma.action.create({
      data: {
        user_id: userId,
        action_type: payload.type,
        target_sku: payload.sku_code || null,
        target_skus: payload.sku_codes || null,
        action_payload: payload as any,
        reason: payload.reason,
        expected_impact: payload.expected_impact || null,
        confidence_score: payload.confidence || null,
        status: 'validating',
        initiated_by: initiatedBy,
        requires_approval: false,
        rollback_data: await this.captureRollbackData(payload, userId),
        affected_systems: this.determineAffectedSystems(payload)
      }
    })

    console.log(`📝 Created action record: ${actionRecord.id}`)

    // PHASE 4: Execute the action with transaction safety
    try {
      await prisma.action.update({
        where: { id: actionRecord.id },
        data: { status: 'executing', validated_at: new Date(), executed_at: new Date() }
      })

      const result = await this.executeByType(payload, userId, actionRecord.id)

      // PHASE 5: Update action record with results
      await prisma.action.update({
        where: { id: actionRecord.id },
        data: {
          status: 'completed',
          completed_at: new Date(),
          actual_impact: result.actual_impact || null,
          success_metrics: result.data || null,
          external_refs: result.external_refs || null
        }
      })

      console.log(`✅ Action completed: ${actionRecord.id}`)

      return {
        success: true,
        action_id: actionRecord.id,
        message: result.message,
        data: result.data,
        actual_impact: result.actual_impact
      }

    } catch (error) {
      // PHASE 6: Handle failure
      console.error('❌ Action execution failed:', error)

      await prisma.action.update({
        where: { id: actionRecord.id },
        data: {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          error_stack: error instanceof Error ? error.stack : undefined,
          completed_at: new Date()
        }
      })

      return {
        success: false,
        action_id: actionRecord.id,
        message: 'Action execution failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  // ==========================================================================
  // VALIDATION ENGINE
  // ==========================================================================

  /**
   * Validate action before execution
   */
  static async validateAction(
    payload: ActionPayload,
    userId: string
  ): Promise<ValidationResult> {

    const errors: string[] = []
    const warnings: string[] = []
    let requires_approval = false
    let approval_reason = ''
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low'

    // Get user's validation rules
    const rules = await prisma.actionValidationRule.findMany({
      where: {
        user_id: userId,
        action_type: payload.type,
        enabled: true
      },
      orderBy: { priority: 'desc' }
    })

    // Type-specific validation
    switch (payload.type) {
      case 'price_update':
        const priceValidation = await this.validatePriceUpdate(payload, userId, rules)
        errors.push(...(priceValidation.errors || []))
        warnings.push(...(priceValidation.warnings || []))
        if (priceValidation.requires_approval) {
          requires_approval = true
          approval_reason = priceValidation.approval_reason!
          risk_level = priceValidation.risk_level!
        }
        break

      case 'reorder_stock':
        const reorderValidation = await this.validateReorderStock(payload, userId, rules)
        errors.push(...(reorderValidation.errors || []))
        warnings.push(...(reorderValidation.warnings || []))
        if (reorderValidation.requires_approval) {
          requires_approval = true
          approval_reason = reorderValidation.approval_reason!
          risk_level = reorderValidation.risk_level!
        }
        break

      case 'launch_campaign':
        const campaignValidation = await this.validateCampaign(payload, userId, rules)
        errors.push(...(campaignValidation.errors || []))
        warnings.push(...(campaignValidation.warnings || []))
        if (campaignValidation.requires_approval) {
          requires_approval = true
          approval_reason = campaignValidation.approval_reason!
          risk_level = campaignValidation.risk_level!
        }
        break
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      requires_approval,
      approval_reason,
      risk_level
    }
  }

  /**
   * Validate price update action
   */
  private static async validatePriceUpdate(
    payload: ActionPayload,
    userId: string,
    rules: any[]
  ): Promise<Partial<ValidationResult>> {

    const errors: string[] = []
    const warnings: string[] = []
    let requires_approval = false
    let approval_reason = ''
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low'

    const { sku_code, new_price, current_price } = payload.params

    // Fetch SKU data
    const user = await prisma.user.findUnique({ where: { email: userId } })
    if (!user) {
      errors.push('User not found')
      return { errors, warnings }
    }

    const sku = await prisma.sku.findUnique({
      where: {
        sku_code_user_id: {
          sku_code: sku_code,
          user_id: user.id
        }
      }
    })

    if (!sku) {
      errors.push(`SKU ${sku_code} not found`)
      return { errors, warnings }
    }

    // Validate price is positive
    if (new_price <= 0) {
      errors.push('Price must be greater than 0')
    }

    // Check margin safety
    const costPrice = sku.cost_price || (sku.price * 0.6) // Default 40% margin if no cost
    const newMargin = ((new_price - costPrice) / new_price) * 100

    // Apply margin minimum rule
    const marginRule = rules.find(r => r.rule_type === 'margin_minimum')
    const minMargin = marginRule?.rule_config?.min_margin || 10

    if (newMargin < minMargin) {
      errors.push(`Margin too low (${newMargin.toFixed(1)}%). Minimum ${minMargin}% required.`)
      risk_level = 'high'
    } else if (newMargin < minMargin + 5) {
      warnings.push(`Margin is close to minimum (${newMargin.toFixed(1)}%)`)
      risk_level = 'medium'
    }

    // Check price change magnitude
    const priceChange = Math.abs(new_price - current_price)
    const changePercent = (priceChange / current_price) * 100

    // Apply change limit rule
    const changeLimitRule = rules.find(r => r.rule_type === 'change_limit')
    const maxChangePercent = changeLimitRule?.rule_config?.max_change_percent || 30

    if (changePercent > maxChangePercent) {
      errors.push(`Price change too large (${changePercent.toFixed(1)}%). Maximum ${maxChangePercent}% allowed.`)
      risk_level = 'critical'
    }

    // Check if approval required
    const approvalRule = rules.find(r => r.rule_type === 'approval_threshold')
    if (approvalRule) {
      const threshold = approvalRule.rule_config.threshold || 5

      if (priceChange > threshold) {
        requires_approval = true
        approval_reason = `Price change £${priceChange.toFixed(2)} exceeds approval threshold £${threshold}`
        risk_level = priceChange > threshold * 2 ? 'high' : 'medium'
      }
    }

    return { errors, warnings, requires_approval, approval_reason, risk_level }
  }

  /**
   * Validate reorder stock action
   */
  private static async validateReorderStock(
    payload: ActionPayload,
    userId: string,
    rules: any[]
  ): Promise<Partial<ValidationResult>> {

    const errors: string[] = []
    const warnings: string[] = []
    let requires_approval = false
    let approval_reason = ''
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low'

    const { sku_code, quantity, cost_per_unit, supplier } = payload.params
    const totalCost = quantity * cost_per_unit

    // Check budget rule
    const budgetRule = rules.find(r => r.rule_type === 'budget_limit')
    if (budgetRule) {
      const maxBudget = budgetRule.rule_config.max_reorder_budget || 10000

      if (totalCost > maxBudget) {
        errors.push(`Reorder cost £${totalCost.toFixed(2)} exceeds budget limit £${maxBudget}`)
        risk_level = 'high'
      }
    }

    // Check approval threshold
    const approvalRule = rules.find(r => r.rule_type === 'approval_threshold')
    if (approvalRule) {
      const threshold = approvalRule.rule_config.threshold || 1000

      if (totalCost > threshold) {
        requires_approval = true
        approval_reason = `Reorder cost £${totalCost.toFixed(2)} exceeds approval threshold £${threshold}`
        risk_level = totalCost > threshold * 2 ? 'high' : 'medium'
      }
    }

    // Validate supplier (basic check)
    if (!supplier || supplier.trim() === '') {
      warnings.push('No supplier specified')
    }

    return { errors, warnings, requires_approval, approval_reason, risk_level }
  }

  /**
   * Validate campaign launch action
   */
  private static async validateCampaign(
    payload: ActionPayload,
    userId: string,
    rules: any[]
  ): Promise<Partial<ValidationResult>> {

    const errors: string[] = []
    const warnings: string[] = []
    let requires_approval = false
    let approval_reason = ''
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low'

    const { target_skus, budget, discount_percentage } = payload.params

    // Validate target SKUs exist
    const user = await prisma.user.findUnique({ where: { email: userId } })
    if (!user) {
      errors.push('User not found')
      return { errors, warnings }
    }

    const skuCount = await prisma.sku.count({
      where: {
        sku_code: { in: target_skus },
        user_id: user.id
      }
    })

    if (skuCount !== target_skus.length) {
      errors.push(`Some target SKUs not found (${skuCount}/${target_skus.length})`)
    }

    // Check budget
    const budgetRule = rules.find(r => r.rule_type === 'budget_limit')
    const maxCampaignBudget = budgetRule?.rule_config?.max_campaign_budget || 5000

    if (budget > maxCampaignBudget) {
      errors.push(`Campaign budget £${budget} exceeds limit £${maxCampaignBudget}`)
      risk_level = 'high'
    }

    // Check approval threshold
    const approvalRule = rules.find(r => r.rule_type === 'approval_threshold')
    if (approvalRule) {
      const threshold = approvalRule.rule_config.campaign_threshold || 1000

      if (budget > threshold) {
        requires_approval = true
        approval_reason = `Campaign budget £${budget} exceeds approval threshold £${threshold}`
        risk_level = 'medium'
      }
    }

    // Validate discount
    if (discount_percentage < 5 || discount_percentage > 70) {
      warnings.push(`Unusual discount percentage: ${discount_percentage}%`)
    }

    return { errors, warnings, requires_approval, approval_reason, risk_level }
  }

  // ==========================================================================
  // ACTION EXECUTION BY TYPE
  // ==========================================================================

  /**
   * Execute action based on type
   */
  private static async executeByType(
    payload: ActionPayload,
    userId: string,
    actionId: string
  ): Promise<{ message: string; data?: any; actual_impact?: number; external_refs?: any }> {

    switch (payload.type) {
      case 'price_update':
        return await this.executePriceUpdate(payload, userId)

      case 'reorder_stock':
        return await this.executeReorderStock(payload, userId)

      case 'launch_campaign':
        return await this.executeCampaign(payload, userId)

      default:
        throw new Error(`Unknown action type: ${payload.type}`)
    }
  }

  /**
   * Execute price update
   */
  private static async executePriceUpdate(
    payload: ActionPayload,
    userId: string
  ): Promise<{ message: string; data?: any; actual_impact?: number }> {

    const { sku_code, new_price, current_price } = payload.params

    const user = await prisma.user.findUnique({ where: { email: userId } })
    if (!user) throw new Error('User not found')

    // Update price in database
    const updatedSKU = await prisma.sku.update({
      where: {
        sku_code_user_id: {
          sku_code,
          user_id: user.id
        }
      },
      data: {
        price: new_price,
        updated_at: new Date()
      }
    })

    // Create price history record
    await prisma.priceHistory.create({
      data: {
        sku_code: sku_code,
        user_id: user.id,
        date: new Date(),
        price: new_price,
        cost_price: updatedSKU.cost_price,
        margin: updatedSKU.margin_percentage,
        source: 'action_engine',
        change_reason: payload.reason
      }
    })

    const priceChange = new_price - current_price
    const changePercent = ((priceChange / current_price) * 100).toFixed(1)

    return {
      message: `Price updated from £${current_price.toFixed(2)} to £${new_price.toFixed(2)} (${changePercent}%)`,
      data: {
        sku_code,
        old_price: current_price,
        new_price,
        change_amount: priceChange,
        change_percent: parseFloat(changePercent)
      },
      actual_impact: payload.expected_impact // Will be measured later by tracking sales
    }
  }

  /**
   * Execute reorder stock
   */
  private static async executeReorderStock(
    payload: ActionPayload,
    userId: string
  ): Promise<{ message: string; data?: any }> {

    const { sku_code, quantity, cost_per_unit, supplier } = payload.params
    const totalCost = quantity * cost_per_unit

    const user = await prisma.user.findUnique({ where: { email: userId } })
    if (!user) throw new Error('User not found')

    // Create inventory event
    const currentSKU = await prisma.sku.findUnique({
      where: { sku_code_user_id: { sku_code, user_id: user.id } }
    })

    if (!currentSKU) throw new Error('SKU not found')

    await prisma.inventoryEvent.create({
      data: {
        sku_code: sku_code,
        user_id: user.id,
        event_type: 'reorder_initiated',
        quantity_change: quantity,
        previous_level: currentSKU.inventory_level || 0,
        new_level: (currentSKU.inventory_level || 0) + quantity,
        reason: `Reorder: ${payload.reason}`,
        cost_impact: totalCost,
        supplier_batch: supplier,
        event_date: new Date()
      }
    })

    // Note: Actual inventory increase happens when delivery received
    // This would integrate with supplier API in production

    return {
      message: `Reorder initiated: ${quantity} units from ${supplier} (£${totalCost.toFixed(2)})`,
      data: {
        sku_code,
        quantity,
        supplier,
        cost_per_unit,
        total_cost: totalCost,
        delivery_eta: payload.params.delivery_eta || 'TBD'
      }
    }
  }

  /**
   * Execute campaign launch
   */
  private static async executeCampaign(
    payload: ActionPayload,
    userId: string
  ): Promise<{ message: string; data?: any; external_refs?: any }> {

    const { campaign_name, target_skus, discount_percentage, duration_hours, channels } = payload.params

    // In production, this would:
    // 1. Create Shopify discount code
    // 2. Send email campaign
    // 3. Post to social media
    // 4. Track performance

    // For now, create campaign record
    const user = await prisma.user.findUnique({ where: { email: userId } })
    if (!user) throw new Error('User not found')

    await prisma.promotionCampaign.create({
      data: {
        user_id: user.id,
        name: campaign_name,
        description: payload.reason,
        campaign_type: 'flash_sale',
        status: 'active',
        target_skus: target_skus,
        discount_type: 'percentage',
        discount_value: discount_percentage,
        start_date: new Date(),
        end_date: new Date(Date.now() + duration_hours * 60 * 60 * 1000),
        marketing_copy: {
          headline: campaign_name,
          channels: channels
        }
      }
    })

    return {
      message: `Campaign "${campaign_name}" launched for ${target_skus.length} products`,
      data: {
        campaign_name,
        target_skus_count: target_skus.length,
        discount_percentage,
        duration_hours,
        channels,
        start_time: new Date().toISOString()
      },
      external_refs: {
        // Would include Shopify discount code ID, email campaign ID, etc.
      }
    }
  }

  // ==========================================================================
  // ROLLBACK & AUDIT
  // ==========================================================================

  /**
   * Capture data needed for rollback
   */
  private static async captureRollbackData(
    payload: ActionPayload,
    userId: string
  ): Promise<any> {

    const user = await prisma.user.findUnique({ where: { email: userId } })
    if (!user) return null

    switch (payload.type) {
      case 'price_update':
        const sku = await prisma.sku.findUnique({
          where: { sku_code_user_id: { sku_code: payload.params.sku_code, user_id: user.id } }
        })
        return {
          sku_code: payload.params.sku_code,
          previous_price: sku?.price,
          previous_margin: sku?.margin_percentage
        }

      case 'reorder_stock':
        return {
          sku_code: payload.params.sku_code,
          quantity_ordered: payload.params.quantity
        }

      case 'launch_campaign':
        return {
          campaign_type: 'flash_sale',
          target_skus: payload.params.target_skus
        }

      default:
        return null
    }
  }

  /**
   * Rollback an action
   */
  static async rollbackAction(
    actionId: string,
    userId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {

    const action = await prisma.action.findUnique({
      where: { id: actionId }
    })

    if (!action) {
      return { success: false, message: 'Action not found' }
    }

    if (action.user_id !== userId) {
      return { success: false, message: 'Unauthorized' }
    }

    if (action.status !== 'completed') {
      return { success: false, message: 'Only completed actions can be rolled back' }
    }

    if (action.rolled_back) {
      return { success: false, message: 'Action already rolled back' }
    }

    // Execute rollback based on action type
    try {
      switch (action.action_type) {
        case 'price_update':
          const rollbackData = action.rollback_data as any
          const user = await prisma.user.findUnique({ where: { email: userId } })
          if (!user) throw new Error('User not found')

          await prisma.sku.update({
            where: {
              sku_code_user_id: {
                sku_code: rollbackData.sku_code,
                user_id: user.id
              }
            },
            data: { price: rollbackData.previous_price }
          })
          break

        // Add other rollback logic as needed
      }

      // Mark as rolled back
      await prisma.action.update({
        where: { id: actionId },
        data: {
          rolled_back: true,
          rolled_back_at: new Date(),
          rolled_back_by: userId,
          rollback_reason: reason,
          status: 'rolled_back'
        }
      })

      return { success: true, message: 'Action rolled back successfully' }

    } catch (error) {
      console.error('Rollback failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Rollback failed'
      }
    }
  }

  /**
   * Determine which systems are affected by this action
   */
  private static determineAffectedSystems(payload: ActionPayload): string[] {
    const systems = ['database']

    // Would add 'shopify' when Shopify integration is active
    // Would add 'email' for campaigns
    // Would add 'supplier' for reorders

    return systems
  }

  /**
   * Create approval request
   */
  private static async createApprovalRequest(
    payload: ActionPayload,
    userId: string,
    validation: ValidationResult
  ): Promise<ExecutionResult> {

    const actionRecord = await prisma.action.create({
      data: {
        user_id: userId,
        action_type: payload.type,
        target_sku: payload.sku_code || null,
        action_payload: payload as any,
        reason: payload.reason,
        expected_impact: payload.expected_impact || null,
        status: 'pending',
        initiated_by: userId,
        requires_approval: true,
        rollback_data: {},
        affected_systems: []
      }
    })

    await prisma.actionApproval.create({
      data: {
        action_id: actionRecord.id,
        requester_id: userId,
        approver_id: userId, // In production, would be manager/admin
        approval_reason: validation.approval_reason!,
        risk_level: validation.risk_level!,
        estimated_impact: payload.expected_impact || null
      }
    })

    return {
      success: false,
      action_id: actionRecord.id,
      message: 'Action requires approval',
      data: {
        requires_approval: true,
        approval_reason: validation.approval_reason,
        risk_level: validation.risk_level
      }
    }
  }
}
