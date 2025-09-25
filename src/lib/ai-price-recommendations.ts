// src/lib/ai-price-recommendations.ts
// Claude-powered intelligent price recommendations

import { AlcoholSKU } from '@/types'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ClaudePriceRecommendation {
  sku: string
  category: string
  brand: string
  currentPrice: number
  recommendedPrice: number
  changePercentage: number
  action: 'increase_price' | 'decrease_price' | 'maintain_price' | 'promotional_pricing' | 'premium_positioning' | 'clearance' | 'reorder_stock'
  reason: string
  confidence: number
  weeklySales: number
  inventoryLevel: number
  weeksOfStock: number
  revenueImpact: number
  marketContext?: string
  competitorContext?: string
  seasonalContext?: string
  riskFactors?: string[]
  implementationNotes?: string[]
}

export class AIPriceRecommendations {

  static async generateIntelligentPricing(
    alcoholSKUs: AlcoholSKU[],
    competitorData: any[] = [],
    seasonalContext?: any
  ): Promise<ClaudePriceRecommendation[]> {
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found - using basic price recommendations')
      return this.generateBasicRecommendations(alcoholSKUs, competitorData)
    }

    if (alcoholSKUs.length === 0) {
      console.log('⚠️ No SKU data for price recommendations')
      return []
    }

    try {
      console.log('💰 Generating AI-powered price recommendations using Claude...')
      
      const prompt = this.buildPricingPrompt(alcoholSKUs, competitorData, seasonalContext)
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
      
      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      console.log('✅ Claude pricing response received, length:', responseText.length)
      
      // Parse JSON response
      let pricingData;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('❌ No JSON found in Claude pricing response - using basic recommendations')
          return this.generateBasicRecommendations(alcoholSKUs, competitorData)
        }
        
        pricingData = JSON.parse(jsonMatch[0])
        console.log('✅ Successfully parsed pricing recommendations JSON')
        
      } catch (parseError) {
        console.error('❌ Failed to parse pricing JSON:', parseError)
        return this.generateBasicRecommendations(alcoholSKUs, competitorData)
      }
      
      const recommendations = pricingData.price_recommendations || pricingData.recommendations || []
      
      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        console.error('❌ No valid pricing recommendations found - using basic recommendations')
        return this.generateBasicRecommendations(alcoholSKUs, competitorData)
      }
      
      console.log(`💰 Generated ${recommendations.length} Claude-powered price recommendations`)
      
      // Transform recommendations to match our interface
      const transformedRecommendations = recommendations.map((rec: any, index: number) => {
        const currentPrice = parseFloat(rec.current_price) || 0
        const recommendedPrice = parseFloat(rec.recommended_price) || currentPrice
        const changePercentage = currentPrice > 0 ? ((recommendedPrice - currentPrice) / currentPrice) * 100 : 0
        
        return {
          sku: rec.sku || `UNKNOWN-${index}`,
          category: rec.category || 'spirits',
          brand: rec.brand || 'Unknown',
          currentPrice,
          recommendedPrice,
          changePercentage,
          action: rec.action || 'maintain_price',
          reason: rec.reason || 'AI-generated recommendation',
          confidence: parseFloat(rec.confidence) || 0.7,
          weeklySales: parseFloat(rec.weekly_sales) || 0,
          inventoryLevel: parseInt(rec.inventory_level) || 0,
          weeksOfStock: parseFloat(rec.weeks_of_stock) || 0,
          revenueImpact: parseFloat(rec.revenue_impact) || 0,
          marketContext: rec.market_context || '',
          competitorContext: rec.competitor_context || '',
          seasonalContext: rec.seasonal_context || '',
          riskFactors: Array.isArray(rec.risk_factors) ? rec.risk_factors : [],
          implementationNotes: Array.isArray(rec.implementation_notes) ? rec.implementation_notes : []
        }
      })

      // Sort by revenue impact
      const sortedRecommendations = transformedRecommendations.sort((a, b) => 
        Math.abs(b.revenueImpact) - Math.abs(a.revenueImpact)
      )
      
      console.log(`📊 Returning ${sortedRecommendations.length} Claude-generated price recommendations`)
      return sortedRecommendations
      
    } catch (error) {
      console.error('❌ Claude pricing recommendations failed:', error)
      return this.generateBasicRecommendations(alcoholSKUs, competitorData)
    }
  }

  private static buildPricingPrompt(
    alcoholSKUs: AlcoholSKU[],
    competitorData: any[],
    seasonalContext?: any
  ): string {
    
    const currentMonth = new Date().getMonth() + 1
    const isChristmasSeason = currentMonth === 12 || currentMonth === 11
    const isSummerSeason = currentMonth >= 6 && currentMonth <= 8
    
    // Analyze product portfolio
    const totalSKUs = alcoholSKUs.length
    const avgPrice = alcoholSKUs.reduce((sum, sku) => sum + parseFloat(sku.price), 0) / totalSKUs
    const premiumProducts = alcoholSKUs.filter(sku => parseFloat(sku.price) > 40).length
    const slowMovers = alcoholSKUs.filter(sku => parseFloat(sku.weekly_sales) < 1).length
    
    // Get top products for detailed analysis
    const topProducts = alcoholSKUs
      .sort((a, b) => parseFloat(b.weekly_sales) - parseFloat(a.weekly_sales))
      .slice(0, 20)
    
    return `You are an expert UK alcohol pricing strategist. Generate intelligent price recommendations for this alcohol retailer's inventory.

MARKET CONTEXT:
- Current Month: ${currentMonth} ${isChristmasSeason ? '(Christmas Season)' : isSummerSeason ? '(Summer Season)' : ''}
- UK Alcohol Market: Premium segment growing, price-conscious consumers, seasonal demand patterns
- Economic Climate: Inflation concerns, discretionary spending pressure

PORTFOLIO ANALYSIS:
- Total Products: ${totalSKUs}
- Average Price: £${avgPrice.toFixed(2)}
- Premium Products (>£40): ${premiumProducts}
- Slow Movers (<1 weekly sales): ${slowMovers}

COMPETITIVE DATA:
${competitorData.length > 0 ? 
  `- Competitor Price Points Available: ${competitorData.length}
- Average Price Variance: ${(competitorData.reduce((sum, c) => sum + Math.abs(c.price_difference_percentage || 0), 0) / competitorData.length).toFixed(1)}%` :
  '- Limited competitive data available'
}

TOP PERFORMING PRODUCTS:
${topProducts.map((sku, index) => 
  `${index + 1}. ${sku.sku}: ${sku.category}, £${sku.price}, ${sku.weekly_sales} weekly sales, ${sku.inventory_level} units stock`
).join('\n')}

ADDITIONAL PRODUCTS SAMPLE:
${alcoholSKUs.slice(20, 35).map(sku => 
  `- ${sku.sku}: ${sku.category}, £${sku.price}, ${sku.weekly_sales} weekly sales, ${sku.inventory_level} units`
).join('\n')}

Generate intelligent price recommendations for the TOP 15 PRODUCTS that consider:

1. **Market Psychology**: Consumer price sensitivity, brand perception, premium positioning
2. **Competitive Dynamics**: How pricing affects market position vs competitors  
3. **Seasonal Timing**: Current seasonal demand patterns and upcoming opportunities
4. **Revenue Optimization**: Balance between volume and margin for maximum revenue
5. **Risk Management**: Potential downside risks and mitigation strategies

Each recommendation should be strategic, not just rule-based.

Return ONLY this JSON format:

{
  "price_recommendations": [
    {
      "sku": "${topProducts[0]?.sku || 'EXAMPLE-001'}",
      "category": "${topProducts[0]?.category || 'spirits'}",
      "brand": "${topProducts[0]?.brand || 'Premium Brand'}",
      "current_price": ${parseFloat(topProducts[0]?.price || '50')},
      "recommended_price": ${parseFloat(topProducts[0]?.price || '50') * 1.08},
      "action": "increase_price",
      "reason": "Strong velocity (${topProducts[0]?.weekly_sales || '5'} weekly sales) indicates demand exceeds price sensitivity. Premium positioning opportunity in ${topProducts[0]?.category || 'spirits'} category with 8% increase still below competitor premium threshold",
      "confidence": 0.85,
      "weekly_sales": ${parseFloat(topProducts[0]?.weekly_sales || '5')},
      "inventory_level": ${parseInt(topProducts[0]?.inventory_level || '50')},
      "weeks_of_stock": ${parseInt(topProducts[0]?.inventory_level || '50') / parseFloat(topProducts[0]?.weekly_sales || '5')},
      "revenue_impact": ${(parseFloat(topProducts[0]?.price || '50') * 0.08 * parseFloat(topProducts[0]?.weekly_sales || '5') * 4.33)},
      "market_context": "UK ${topProducts[0]?.category || 'spirits'} market showing resilience with premium segment growth",
      "competitor_context": "Positioned competitively within premium tier, room for strategic increase",
      "seasonal_context": "${isChristmasSeason ? 'Christmas gift season supports premium pricing' : isSummerSeason ? 'Summer demand patterns favor this category' : 'Stable seasonal demand'}",
      "risk_factors": [
        "Price elasticity threshold around 10% increase",
        "Competitor response potential",
        "Economic headwinds affecting discretionary spend"
      ],
      "implementation_notes": [
        "Implement gradual increase over 2 weeks",
        "Monitor sales velocity closely first week",
        "Prepare reversal strategy if volume drops >15%"
      ]
    }
  ]
}

Focus on the TOP 15 performing products. Each recommendation must include:
- Strategic reasoning (not just rules)
- Market context and competitive positioning
- Risk assessment and mitigation
- Implementation guidance

CRITICAL: Return ONLY the JSON object, no additional text. Generate 10-15 recommendations for the highest-impact products.`
  }

  // Fallback to basic recommendations when Claude API fails
  private static generateBasicRecommendations(
    alcoholSKUs: AlcoholSKU[],
    competitorData: any[]
  ): ClaudePriceRecommendation[] {
    
    console.log('🔄 Generating basic fallback price recommendations')

    return alcoholSKUs.slice(0, 25).map(sku => {
      const currentPrice = parseFloat(sku.price)
      const weeklySales = parseFloat(sku.weekly_sales)
      const inventoryLevel = parseInt(sku.inventory_level)
      const weeksOfStock = weeklySales > 0 ? inventoryLevel / weeklySales : 999

      let action: ClaudePriceRecommendation['action'] = 'maintain_price'
      let recommendedPrice = currentPrice
      let confidence = 0.7
      let reason = 'Current pricing appears optimal'

      // Basic logic
      if (weeksOfStock < 2) {
        action = 'reorder_stock'
        reason = `Critical stock level - only ${weeksOfStock.toFixed(1)} weeks remaining`
        confidence = 0.95
      } else if (weeksOfStock > 12 && inventoryLevel > 20) {
        action = 'promotional_pricing'
        recommendedPrice = currentPrice * 0.85
        reason = `Overstock clearance - ${weeksOfStock.toFixed(1)} weeks of inventory`
        confidence = 0.8
      } else if (weeklySales < 0.5 && inventoryLevel > 10) {
        action = 'clearance'
        recommendedPrice = currentPrice * 0.8
        reason = `Slow seller requiring clearance (${weeklySales} weekly sales)`
        confidence = 0.75
      } else if (weeklySales > 5 && weeksOfStock < 6) {
        action = 'increase_price'
        recommendedPrice = currentPrice * 1.1
        reason = `High demand product - can support price increase`
        confidence = 0.8
      }

      // Competitor adjustments
      const competitorInfo = competitorData.find(c => c.sku === sku.sku)
      if (competitorInfo) {
        const priceDiff = competitorInfo.price_difference_percentage
        if (priceDiff > 15 && action !== 'reorder_stock') {
          action = 'decrease_price'
          recommendedPrice = competitorInfo.competitor_price * 1.05
          reason = `Significantly overpriced vs competitors (${priceDiff.toFixed(1)}% higher)`
          confidence = 0.85
        }
      }

      recommendedPrice = Math.round(recommendedPrice * 100) / 100
      const changePercentage = ((recommendedPrice - currentPrice) / currentPrice) * 100
      const revenueImpact = (recommendedPrice - currentPrice) * weeklySales * 4.33

      return {
        sku: sku.sku,
        category: sku.category,
        brand: sku.brand || 'Unknown',
        currentPrice,
        recommendedPrice,
        changePercentage,
        action,
        reason,
        confidence,
        weeklySales,
        inventoryLevel,
        weeksOfStock: Math.round(weeksOfStock * 10) / 10,
        revenueImpact,
        marketContext: 'Basic analysis - upgrade to AI recommendations for strategic insights',
        competitorContext: competitorInfo ? `Competitor price: £${competitorInfo.competitor_price}` : 'No competitor data',
        seasonalContext: 'Seasonal factors not considered in basic mode'
      }
    })
  }
}