import { Resend } from 'resend';
import { render } from '@react-email/render';
import BookingConfirmationEmail from '../emails/BookingConfirmation';

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();
    const html = await render(BookingConfirmationEmail(bookingData));

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [bookingData.memberEmail],
      subject: 'Flight Booking Confirmation',
      html: html,
    });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 