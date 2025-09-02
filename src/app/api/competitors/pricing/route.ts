// src/app/api/competitors/pricing/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PostgreSQLService } from '@/lib/database-postgres'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    const days = parseInt(searchParams.get('days') || '7')
    
    if (!userId && !userEmail) {
      return NextResponse.json({ 
        error: 'User authentication required' 
      }, { status: 401 })
    }
    
    const userIdentifier = userId || userEmail || ''
    console.log(`Getting competitor pricing data for user: ${userIdentifier}`)
    
    // Get competitor data from database
    const competitorData = await PostgreSQLService.getCompetitorData(userIdentifier, days)
    
    // Transform into comparison results
    const comparisons = transformToComparisonResults(competitorData)
    
    return NextResponse.json({
      success: true,
      comparisons,
      count: comparisons.length,
      days_analyzed: days,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Competitor pricing API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch competitor pricing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function transformToComparisonResults(competitorData: any[]): any[] {
  // Group competitor prices by SKU
  const groupedBySKU = competitorData.reduce((acc, comp) => {
    if (!acc[comp.sku]) {
      acc[comp.sku] = {
        sku: comp.sku,
        our_price: comp.our_price,
        competitors: []
      }
    }
    acc[comp.sku].competitors.push(comp)
    return acc
  }, {} as Record<string, any>)
  
  // Transform to comparison results format
  return Object.values(groupedBySKU).map((skuData: any) => {
    const competitors = skuData.competitors
    const ourPrice = skuData.our_price
    
    // Calculate market position
    const allPrices = [ourPrice, ...competitors.map((c: any) => c.competitor_price)].sort((a, b) => a - b)
    const ourRank = allPrices.indexOf(ourPrice) + 1
    const percentile = ((allPrices.length - ourRank) / (allPrices.length - 1)) * 100
    const avgCompPrice = competitors.reduce((sum: number, c: any) => sum + c.competitor_price, 0) / competitors.length
    const priceAdvantage = ((ourPrice - avgCompPrice) / avgCompPrice) * 100
    
    // Generate recommendations
    let action: 'maintain' | 'increase' | 'decrease' | 'investigate' = 'maintain'
    let targetPrice: number | undefined
    let reasoning = 'Competitively positioned'
    let urgency: 'low' | 'medium' | 'high' = 'low'
    
    if (priceAdvantage > 15) {
      action = 'decrease'
      targetPrice = avgCompPrice * 1.05
      reasoning = `${priceAdvantage.toFixed(1)}% above market average - consider price reduction`
      urgency = 'medium'
    } else if (priceAdvantage < -15) {
      action = 'increase'
      targetPrice = avgCompPrice * 0.95
      reasoning = `${Math.abs(priceAdvantage).toFixed(1)}% below market - pricing opportunity`
      urgency = 'low'
    }
    
    return {
      sku: skuData.sku,
      our_price: ourPrice,
      competitor_prices: competitors,
      market_position: {
        rank: ourRank,
        percentile: Math.round(percentile),
        price_advantage: Math.round(priceAdvantage * 100) / 100
      },
      recommendations: {
        action,
        target_price: targetPrice,
        reasoning,
        urgency
      }
    }
  })
}