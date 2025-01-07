import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import BookingConfirmationEmail from '../../../emails/BookingConfirmation'

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY)

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: Request) {
  try {
    console.log('API route hit, processing request...')
    
    const bookingData = await request.json()
    console.log('Received booking data:', bookingData)
    
    const html = await render(BookingConfirmationEmail(bookingData))

    console.log('Attempting to send email with Resend...')
    const data = await resend.emails.send({
      from: 'Aeroclub <onboarding@resend.dev>',
      to: ['callum.soutar@me.com'], // For testing, hardcode your email
      subject: '✈️ Your flight booking is confirmed | Aeroclub',
      html: html,
      replyTo: bookingData.memberEmail
    })
    console.log('Email sent successfully:', data)

    return NextResponse.json(
      { success: true, data },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 