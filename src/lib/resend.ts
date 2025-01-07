const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/email'  // Vercel API route path
  : 'http://localhost:3001/api/email' // Local development server

export async function sendBookingConfirmation(bookingData: any) {
  try {
    console.log('Starting email send process with:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
      // Add these options for better error handling
      credentials: 'same-origin',
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
} 