const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://aero-manager-pro.vercel.app/src/pages/api/email'  // Update this path
  : 'http://localhost:3001/api/email'

export async function sendBookingConfirmation(bookingData: any) {
  try {
    console.log('Starting email send process with:', API_URL);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
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