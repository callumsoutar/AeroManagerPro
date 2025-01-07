const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://aero-manager-pro.vercel.app/api/email'  // Note: just /api/email, not /src/pages/api/email
  : 'http://localhost:3001/api/email'

export async function sendBookingConfirmation(bookingData: any) {
  try {
    // Debug environment and request details
    console.group('📧 Sending Booking Confirmation Email')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('API URL:', API_URL)
    console.log('Booking data:', JSON.stringify(bookingData, null, 2))
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
      mode: 'cors'
    });

    // Debug response details
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Response error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const result = await response.json()
    console.log('Response success:', result)
    console.groupEnd()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email')
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('📧 Email sending error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    console.groupEnd()
    return { success: false, error }
  }
} 