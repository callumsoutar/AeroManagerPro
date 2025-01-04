import { Navigate, useLocation } from 'react-router-dom'
import { useBooking } from '../hooks/useBooking'

interface ConfirmedBookingGuardProps {
  children: React.ReactNode
  bookingId: string
}

export function ConfirmedBookingGuard({ children, bookingId }: ConfirmedBookingGuardProps) {
  const { data: booking, isLoading } = useBooking(bookingId)
  const location = useLocation()

  if (isLoading) {
    return null // Or a loading spinner
  }

  if (!booking || booking.status !== 'confirmed') {
    return <Navigate to={`/bookings/${bookingId}`} replace state={{ from: location }} />
  }

  return <>{children}</>
} 