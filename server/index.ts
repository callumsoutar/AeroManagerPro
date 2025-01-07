import express from 'express';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import cors from 'cors';
import dotenv from 'dotenv';
import BookingConfirmationEmail from '../src/emails/BookingConfirmation';
import { TrialFlightEmail } from '../src/emails/TrialFlightEmail';

dotenv.config();

process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception:', err);
});

const app = express();
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

console.log('=================================');
console.log('Starting server initialization...');

try {
  // CORS configuration
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true
  }));
  console.log('CORS configured');

  app.use(express.json());
  console.log('JSON middleware configured');

  // Basic health check
  app.get('/', (req, res) => {
    console.log('Root endpoint accessed');
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Test endpoint
  app.get('/api/test', (req, res) => {
    console.log('Test endpoint accessed');
    res.json({ status: 'ok', message: 'Test endpoint working' });
  });

  // Email sending endpoint
  app.post('/api/sendEmail', async (req, res) => {
    console.log('Email endpoint accessed');
    try {
      const bookingData = req.body;
      console.log('Received booking data:', bookingData);

      const html = await render(BookingConfirmationEmail(bookingData));
      console.log('Generated HTML:', html);

      const data = await resend.emails.send({
        from: 'Aeroclub <onboarding@resend.dev>',
        to: ['callum.soutar@me.com'],
        subject: '✈️ Your flight booking is confirmed | Aeroclub',
        html: html,
        replyTo: bookingData.memberEmail
      });
      console.log('Email sent successfully:', data);

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        // In development, also return the HTML for inspection
        res.json({ 
          status: 'ok', 
          success: true, 
          data,
          debug: {
            html,
            template: 'Using template version: ' + new Date().toISOString()
          }
        });
      } else {
        res.json({ status: 'ok', success: true, data });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ 
        status: 'error', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get('/api/previewEmail', async (req, res) => {
    const sampleData = {
      memberName: "Test User",
      bookingDate: new Date().toISOString(),
      aircraftReg: "ZK-TEST",
      instructorName: "Test Instructor",
      startTime: "09:00",
      endTime: "11:00",
      flightType: "Training"
    };

    const html = await render(BookingConfirmationEmail(sampleData));
    res.send(html);
  });

  app.post('/api/sendTrialFlightEmail', async (req, res) => {
    console.log('Trial Flight email endpoint accessed');
    try {
      const bookingData = req.body;
      console.log('Received trial flight data:', bookingData);

      const html = await render(TrialFlightEmail(bookingData));
      console.log('Generated HTML:', html);

      const data = await resend.emails.send({
        from: 'Aeroclub <onboarding@resend.dev>',
        to: ['callum.soutar@me.com'], // Replace with actual email
        subject: '✈️ Your Trial Flight is Confirmed! | Aeroclub',
        html: html,
        replyTo: bookingData.memberEmail
      });

      console.log('Trial Flight email sent successfully:', data);

      res.json({ 
        status: 'ok', 
        success: true, 
        data 
      });
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ 
        status: 'error', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const PORT = process.env.PORT || 3001;
  
  const server = app.listen(PORT, () => {
    console.log('=================================');
    console.log(`Server successfully started on port ${PORT}`);
    console.log(`Test the server at: http://localhost:${PORT}/api/test`);
    console.log(`Email endpoint at: http://localhost:${PORT}/api/sendEmail`);
    console.log('=================================');
  });

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
    } else {
      console.error('Server error:', error);
    }
  });

} catch (error) {
  console.error('Server initialization error:', error);
} 