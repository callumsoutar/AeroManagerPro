import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import BookingConfirmationEmail from '../../../emails/BookingConfirmation'
import { TrialFlightEmail } from '../../../emails/TrialFlightEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const bookingData = await request.json()
    const emailTemplate = bookingData.isTrialFlight ? 
      TrialFlightEmail(bookingData) : 
      BookingConfirmationEmail(bookingData)
    
    const html = await render(emailTemplate)

    const data = await resend.emails.send({
      from: 'Aeroclub <onboarding@resend.dev>',
      to: [process.env.NODE_ENV === 'production' ? bookingData.memberEmail : 'callum.soutar@me.com'],
      subject: bookingData.isTrialFlight ? 
        '✈️ Your Trial Flight is Confirmed! | Aeroclub' :
        '✈️ Your flight booking is confirmed | Aeroclub',
      html: html,
      replyTo: bookingData.memberEmail
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 