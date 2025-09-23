import { NextRequest, NextResponse } from 'next/server'
import { sendResetPasswordEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await sendResetPasswordEmail('ptengelmann@gmail.com', 'test-token-123')
    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}