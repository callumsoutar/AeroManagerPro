import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Home, Users, Plane, CalendarDays, Receipt, Users2, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { pathname } = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: pathname === '/'
    },
    {
      name: 'Home',
      href: '/home',
      icon: Home,
      current: pathname === '/home'
    },
    {
      name: 'Aircraft',
      href: '/aircraft',
      icon: Plane,
      current: pathname === '/aircraft'
    },
    {
      name: 'Scheduler',
      href: '/scheduler',
      icon: CalendarDays,
      current: pathname === '/scheduler'
    },
    {
      name: 'Staff',
      href: '/staff',
      icon: Users2,
      current: pathname === '/staff'
    },
    {
      name: 'Members',
      href: '/members',
      icon: Users,
      current: pathname === '/members'
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: CalendarDays,
      current: pathname === '/bookings'
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: Receipt,
      current: pathname === '/invoices'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: pathname === '/settings'
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#1a1a2e] text-white">
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-semibold flex items-center gap-2">
          <Plane className="h-6 w-6" />
          AeroManager
        </span>
      </div>
      <nav className="mt-5 px-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  item.current
                    ? 'bg-[#262638] text-white'
                    : 'text-gray-300 hover:bg-[#262638] hover:text-white',
                  'group flex items-center px-4 py-2 text-sm font-medium rounded-md'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 