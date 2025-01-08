import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import BookingConfirmationEmail from '../src/emails/BookingConfirmation';

// Debug environment variables on module load
console.log('API Route Environment Variables:', {
  nodeEnv: process.env.NODE_ENV,
  hasResendKey: !!process.env.REACT_APP_RESEND_API_KEY,
  resendKeyLength: process.env.REACT_APP_RESEND_API_KEY?.length || 0,
});

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Route hit:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Processing POST request');
    const bookingData = req.body;
    console.log('Received booking data:', bookingData);

    console.log('Rendering email template');
    const html = await render(BookingConfirmationEmail(bookingData));

    console.log('Attempting to send email with Resend');
    const data = await resend.emails.send({
      from: 'Aeroclub <onboarding@resend.dev>',
      to: ['callum.soutar@me.com'],
      subject: '✈️ Your flight booking is confirmed | Aeroclub',
      html: html,
      replyTo: bookingData.memberEmail
    });
    
    console.log('Email sent successfully:', data);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('API Route Error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 