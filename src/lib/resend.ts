const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://aero-manager-pro.vercel.app/api/email'  // Note: just /api/email, not /src/pages/api/email
  : 'http://localhost:3001/api/email'

export async function sendBookingConfirmation(bookingData: any) {
  try {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Attempting to send email to URL:', API_URL);
    console.log('Booking data:', JSON.stringify(bookingData, null, 2));
    
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
      console.error('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Response success:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Full error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return { success: false, error };
  }
} 