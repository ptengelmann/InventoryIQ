import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing cache functionality...\n')

  // 1. Check if table exists
  try {
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'claude_insights'
      );
    `
    console.log('✅ Table exists:', tableCheck)
  } catch (error) {
    console.error('❌ Table check failed:', error)
    return
  }

  // 2. Check for any existing cached insights
  try {
    const userId = 'pedro@inventoryiq.com'
    const cachedInsights = await prisma.claudeInsight.findMany({
      where: {
        user_id: userId,
        expires_at: { gte: new Date() }
      },
      orderBy: { generated_at: 'desc' }
    })

    console.log(`\n📊 Found ${cachedInsights.length} cached insights for ${userId}`)

    if (cachedInsights.length > 0) {
      const firstInsight = cachedInsights[0]
      const ageMinutes = Math.round((Date.now() - firstInsight.generated_at.getTime()) / 1000 / 60)
      const expiresInMinutes = Math.round((firstInsight.expires_at.getTime() - Date.now()) / 1000 / 60)

      console.log(`\n✨ Cache Details:`)
      console.log(`  - Age: ${ageMinutes} minutes old`)
      console.log(`  - Expires in: ${expiresInMinutes} minutes`)
      console.log(`  - Analysis depth: ${firstInsight.analysis_depth}`)
      console.log(`  - Insight types:`, cachedInsights.map(i => i.insight_type).join(', '))
      console.log(`  - View count: ${firstInsight.view_count}`)
      console.log(`  - Generated at: ${firstInsight.generated_at.toISOString()}`)
      console.log(`  - Expires at: ${firstInsight.expires_at.toISOString()}`)
    } else {
      console.log('ℹ️  No cached insights found (cache miss expected)')
    }

    // 3. Show all cached insights across all users
    const allCached = await prisma.claudeInsight.findMany({
      where: {
        expires_at: { gte: new Date() }
      },
      select: {
        user_id: true,
        generated_at: true,
        expires_at: true,
        view_count: true
      },
      orderBy: { generated_at: 'desc' }
    })

    console.log(`\n🌐 Total active cached insights: ${allCached.length}`)
    if (allCached.length > 0) {
      console.log('Users with cached data:', [...new Set(allCached.map(c => c.user_id))])
    }

  } catch (error) {
    console.error('❌ Query failed:', error)
  }
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
