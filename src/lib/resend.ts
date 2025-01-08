const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export async function sendBookingConfirmation(bookingData: any) {
  try {
    console.log('Starting email send process...');
    console.log('API URL:', API_URL);
    console.log('Booking data:', bookingData);
    
    const response = await fetch(`${API_URL}/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Email send response:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Detailed error in sendBookingConfirmation:', error);
    return { success: false, error };
  }
} 