// CREATE NEW FILE: /api/alerts/manage/route.ts
// Alert Management API for admin operations

import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

// GET /api/alerts/manage - Get all analyses with alert counts for management
export async function GET(request: NextRequest) {
  try {
    const analyses = await DatabaseService.getAllAnalyses()
    
    const analysesWithAlertCounts = analyses.map((analysis: any) => ({
      uploadId: analysis.uploadId,
      fileName: analysis.fileName,
      processedAt: analysis.processedAt,
      totalSKUs: analysis.summary.totalSKUs,
      alertCount: analysis.smartAlerts?.length || 0,
      criticalAlerts: analysis.smartAlerts?.filter((a: any) => a.severity === 'critical').length || 0,
      unreadAlerts: analysis.smartAlerts?.filter((a: any) => !a.acknowledged && !a.resolved).length || 0,
      resolvedAlerts: analysis.smartAlerts?.filter((a: any) => a.resolved).length || 0
    }))
    
    // Sort by most recent first
    analysesWithAlertCounts.sort((a: any, b: any) => 
      new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
    )
    
    return NextResponse.json({
      success: true,
      analyses: analysesWithAlertCounts,
      totalAnalyses: analyses.length,
      totalAlerts: analyses.reduce((sum: number, a: any) => sum + (a.smartAlerts?.length || 0), 0),
      totalUnread: analyses.reduce((sum: number, a: any) => 
        sum + (a.smartAlerts?.filter((alert: any) => !alert.acknowledged && !alert.resolved).length || 0), 0
      )
    })
  } catch (error) {
    console.error('Error fetching analyses for management:', error)
    return NextResponse.json({
      error: 'Failed to fetch analyses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/alerts/manage - Delete analysis
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    const deleteAll = searchParams.get('deleteAll') === 'true'
    
    if (deleteAll) {
      // This would be dangerous - let's not implement for now
      return NextResponse.json({
        error: 'Delete all analyses not implemented for safety'
      }, { status: 400 })
    } else if (analysisId) {
      const success = await DatabaseService.deleteAnalysis(analysisId)
      
      if (!success) {
        return NextResponse.json({
          error: 'Failed to delete analysis'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: 'Analysis deleted successfully'
      })
    } else {
      return NextResponse.json({
        error: 'Must provide analysisId'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error deleting analysis:', error)
    return NextResponse.json({
      error: 'Failed to delete analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}