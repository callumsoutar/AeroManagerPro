import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaPlane, 
  FaCalendarAlt, 
  FaUsers, 
  FaUserFriends,
  FaFileInvoice,
  FaCog
} from 'react-icons/fa';
import { Calendar, Building2 } from 'lucide-react';
import { LayoutDashboard, Home } from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { title: 'Home', icon: <Home size={18} />, path: '/home' },
    { title: 'Reception', icon: <Building2 size={18} />, path: '/reception' },
    { title: 'Aircraft', icon: <FaPlane />, path: '/aircraft' },
    { title: 'Scheduler', icon: <FaCalendarAlt />, path: '/scheduler' },
    { title: 'Staff', icon: <FaUsers />, path: '/staff' },
    { title: 'Members', icon: <FaUserFriends />, path: '/members' },
    { title: 'Bookings', icon: <Calendar size={18} />, path: '/bookings' },
    { title: 'Invoices', icon: <FaFileInvoice />, path: '/invoices' },
    { title: 'Settings', icon: <FaCog />, path: '/settings' },
  ];

  return (
    <aside className="w-[240px] h-screen bg-[#1a1a2e] text-white fixed left-0 top-0 py-5 z-50">
      <div className="px-5 mb-8 flex items-center gap-3">
        <div className="text-blue-400">
          <FaPlane size={24} />
        </div>
        <h1 className="text-lg font-semibold m-0">AeroManager</h1>
      </div>
      
      <nav className="px-3">
        {menuItems.map((item, index) => (
          <Link 
            to={item.path}
            key={index}
          >
            <div 
              className={`flex items-center px-5 py-3 my-1 rounded-lg cursor-pointer hover:bg-[#2d2d44] transition-colors ${
                location.pathname === item.path ? 'bg-[#2d2d44]' : ''
              }`}
            >
              <span className="mr-3 text-base w-5">{item.icon}</span>
              <span className="text-sm">{item.title}</span>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
