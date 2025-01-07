import * as React from 'react';
import { RouterProvider, createBrowserRouter, useParams } from 'react-router-dom';
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
import { Home } from './pages/Home';
import { Layout } from './pages';
import { CreateDefect } from './pages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NewInvoice } from './pages/NewInvoice';
import Reception from './pages/Reception';

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
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/",
          element: <AdminDashboard />
        },
        {
          path: "home",
          element: <Home />
        },
        {
          path: "bookings/:id",
          element: <BookingDetail />
        },
        {
          path: "bookings/:id/edit",
          element: <BookingDetail />
        },
        {
          path: "bookings/:id/checkout",
          element: <CheckoutRoute />
        },
        {
          path: "bookings/:id/check-in",
          element: <FlightCheckIn />
        },
        {
          path: "bookings/:id/flight-details",
          element: <FlightDetailsPage />
        },
        {
          path: "aircraft",
          element: <AircraftPage />
        },
        {
          path: "aircraft/:id",
          element: <AircraftDetail />
        },
        {
          path: "scheduler",
          element: <Scheduler />
        },
        {
          path: "members",
          element: <Members />
        },
        {
          path: "members/:id",
          element: <MemberDetail />
        },
        {
          path: "staff",
          element: <StaffPage />
        },
        {
          path: "staff/:id",
          element: <StaffDetail />
        },
        {
          path: "bookings",
          element: <Bookings />
        },
        {
          path: "invoices",
          element: <Invoices />
        },
        {
          path: "invoices/:id",
          element: <InvoiceDetails />
        },
        {
          path: "defects/new",
          element: <CreateDefect />
        },
        {
          path: "invoices/create",
          element: <NewInvoice />
        },
        {
          path: "reception",
          element: <Reception />
        }
      ]
    }
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
};

export default App;
