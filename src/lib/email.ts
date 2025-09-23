// src/lib/email.ts
import nodemailer from 'nodemailer'

// Create Resend transporter
const createTransporter = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  return nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 587,
    secure: false,
    auth: {
      user: 'resend',
      pass: process.env.RESEND_API_KEY
    }
  })
}

export async function sendResetPasswordEmail(email: string, resetToken: string) {
  try {
    console.log('📧 Starting email send process for:', email)
    console.log('🔑 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('🔑 FROM_EMAIL:', process.env.FROM_EMAIL)
    
    const transporter = createTransporter()
    console.log('✅ Transporter created successfully')
    
    // Construct reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@oscarai.com',
      to: email,
      subject: 'Reset Your OscarAI Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              margin: 0; padding: 0; background-color: #f5f5f5; 
            }
            .container { 
              max-width: 600px; margin: 0 auto; background-color: #ffffff; 
              border-radius: 8px; overflow: hidden; margin-top: 40px;
            }
            .header { 
              background-color: #000000; padding: 40px; text-align: center; 
            }
            .logo { 
              color: #ffffff; font-size: 28px; font-weight: 300; margin: 0; 
            }
            .content { padding: 40px; }
            .title { 
              color: #333; font-size: 24px; font-weight: 300; margin: 0 0 20px; 
            }
            .text { 
              color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px; 
            }
            .button { 
              display: inline-block; background-color: #000000; color: #ffffff; 
              text-decoration: none; padding: 16px 32px; border-radius: 6px; 
              font-weight: 500; font-size: 16px;
            }
            .security-note { 
              background-color: #fff3cd; border-left: 4px solid #ffc107;
              padding: 20px; margin: 30px 0; 
            }
            .security-text { color: #856404; font-size: 14px; margin: 0; }
            .footer { 
              background-color: #f8f9fa; padding: 30px 40px; text-align: center; 
              border-top: 1px solid #e9ecef; color: #666; font-size: 14px;
            }
            .link { color: #007bff; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">OscarAI</h1>
            </div>
            
            <div class="content">
              <h2 class="title">Reset your password</h2>
              
              <p class="text">
                We received a request to reset the password for your OscarAI account. 
                Click the button below to create a new password:
              </p>
              
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <div class="security-note">
                <p class="security-text">
                  <strong>Security Note:</strong> This link expires in 1 hour. 
                  If you didn't request this, please ignore this email.
                </p>
              </div>
              
              <p class="text">
                If the button doesn't work, copy this link:
                <br><br>
                <a href="${resetUrl}" class="link">${resetUrl}</a>
              </p>
            </div>
            
            <div class="footer">
              Need help? Contact support@oscarai.com
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Reset Your OscarAI Password

We received a request to reset your password.

Reset link: ${resetUrl}

This link expires in 1 hour.

If you didn't request this, ignore this email.

Need help? Contact support@oscarai.com
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    
    console.log('Password reset email sent successfully to:', email)
    console.log('Resend Message ID:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    throw new Error('Failed to send reset email')
  }
}

export async function sendPasswordResetConfirmation(email: string) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@oscarai.com',
      to: email,
      subject: 'Password Successfully Reset - OscarAI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset Confirmed</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              margin: 0; padding: 0; background-color: #f5f5f5; 
            }
            .container { 
              max-width: 600px; margin: 40px auto; background-color: #ffffff; 
              border-radius: 8px; overflow: hidden;
            }
            .header { 
              background-color: #000000; padding: 40px; text-align: center; 
            }
            .logo { 
              color: #ffffff; font-size: 28px; font-weight: 300; margin: 0; 
            }
            .content { padding: 40px; }
            .title { 
              color: #333; font-size: 24px; font-weight: 300; margin: 0 0 20px; 
            }
            .success-box { 
              background-color: #d4edda; border-left: 4px solid #28a745;
              padding: 20px; margin: 20px 0; 
            }
            .success-text { color: #155724; font-size: 16px; margin: 0; }
            .text { color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0; }
            .footer { 
              background-color: #f8f9fa; padding: 30px; text-align: center; 
              border-top: 1px solid #e9ecef; color: #666; font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">OscarAI</h1>
            </div>
            
            <div class="content">
              <h2 class="title">Password successfully reset</h2>
              
              <div class="success-box">
                <p class="success-text">
                  Your password has been successfully updated.
                </p>
              </div>
              
              <p class="text">
                You can now sign in with your new password.
              </p>
              
              <p class="text">
                If you didn't make this change, contact us immediately.
              </p>
            </div>
            
            <div class="footer">
              This email was sent for security purposes.
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    await transporter.sendMail(mailOptions)
    console.log('Password reset confirmation sent to:', email)
    
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    // Don't throw - confirmation email is optional
  }
}