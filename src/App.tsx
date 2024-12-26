import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-[200px] p-5 flex-1 bg-white min-h-screen">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/bookings/:id/edit" element={<BookingDetail />} />
            <Route path="/bookings/:id/checkout" element={<CheckoutBooking />} />
            <Route path="/bookings/:id/flight-details" element={<FlightDetailsPage />} />
            <Route path="/aircraft" element={<AircraftPage />} />
            <Route path="/aircraft/:id" element={<AircraftDetail />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/:id" element={<MemberDetail />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff/:id" element={<StaffDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
