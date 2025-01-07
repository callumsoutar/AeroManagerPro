const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/email'  // Vercel API route path
  : 'http://localhost:3001/api/email' // Local development server

export async function sendBookingConfirmation(bookingData: any) {
  try {
    console.log('Starting email send process...')
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email')
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
} 