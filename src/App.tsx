import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Scheduler from './pages/Scheduler';
import AircraftPage from './pages/Aircraft';
import StaffPage from './pages/Staff';
import StaffDetail from './pages/StaffDetail';
import AircraftDetail from './pages/AircraftDetail';
import AdminDashboard from './pages/AdminDashboard';
import BookingDetail from './pages/BookingDetail';
import CheckoutBooking from './pages/CheckoutBooking';
import FlightDetailsPage from './pages/FlightDetailsPage';
import Bookings from './pages/Bookings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FlightCheckIn from './pages/FlightCheckIn';
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import { Toaster } from 'sonner';
import { ConfirmedBookingGuard } from './components/ConfirmedBookingGuard';

const queryClient = new QueryClient();

const CheckoutRoute = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) return null;

  return (
    <ConfirmedBookingGuard bookingId={id}>
      <CheckoutBooking />
    </ConfirmedBookingGuard>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="ml-[240px] p-5 flex-1 bg-white min-h-screen">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/bookings/:id" element={<BookingDetail />} />
              <Route path="/bookings/:id/edit" element={<BookingDetail />} />
              <Route path="/bookings/:id/checkout" element={<CheckoutRoute />} />
              <Route path="/bookings/:id/check-in" element={<FlightCheckIn />} />
              <Route path="/bookings/:id/flight-details" element={<FlightDetailsPage />} />
              <Route path="/aircraft" element={<AircraftPage />} />
              <Route path="/aircraft/:id" element={<AircraftDetail />} />
              <Route path="/scheduler" element={<Scheduler />} />
              <Route path="/members" element={<Members />} />
              <Route path="/members/:id" element={<MemberDetail />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/staff/:id" element={<StaffDetail />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
