import React from 'react'
import { Badge } from "../components/ui/badge"
import { Link } from 'react-router-dom'
import { bookings } from '../data/bookings'
import { Cloud, Wind, Thermometer, Droplets, Gauge } from 'lucide-react'

const WeatherCard = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-8 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-blue-500 rounded-full" />
          <h2 className="text-xl font-semibold text-gray-800">NZPP Weather</h2>
        </div>
        <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
          Updated 5 mins ago
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left column with main weather icon */}
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm">
          <Cloud className="h-14 w-14 text-blue-500 mb-3" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-700">
            Scattered 2400ft
          </span>
        </div>

        {/* Right column with temperature */}
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-orange-500">17</span>
            <span className="text-2xl text-orange-400 ml-1">°C</span>
          </div>
          <div className="flex items-center mt-2">
            <Thermometer className="h-4 w-4 text-orange-400 mr-1" />
            <span className="text-sm text-gray-600">Temperature</span>
          </div>
        </div>
      </div>

      {/* Bottom row with additional metrics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {/* QNH */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col items-center">
          <div className="flex items-center mb-2">
            <Gauge className="h-5 w-5 text-emerald-500 mr-1" strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-600">QNH</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">1013</span>
          <span className="text-xs text-gray-500">hPa</span>
        </div>

        {/* Wind */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col items-center">
          <div className="flex items-center mb-2">
            <Wind className="h-5 w-5 text-blue-500 mr-1" strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-600">Wind</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">340°</span>
          <span className="text-xs text-gray-500">11kt</span>
        </div>

        {/* Dew Point */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col items-center">
          <div className="flex items-center mb-2">
            <Droplets className="h-5 w-5 text-purple-500 mr-1" strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-600">Dew Point</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">6°</span>
          <span className="text-xs text-gray-500">Celsius</span>
        </div>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const stats = [
    { 
      label: 'Flights This Week', 
      value: 23,
      trend: 'up',
      percentage: 12
    },
    { 
      label: 'Flying Hours This Week', 
      value: 50,
      trend: 'up',
      percentage: 8
    },
    { 
      label: 'Active Members', 
      value: 270,
      trend: 'down',
      percentage: 2
    },
    { 
      label: 'Active Aircraft', 
      value: 8,
      trend: 'up',
      percentage: 1
    }
  ]

  const todaysBookings = [
    {
      id: '1',
      aircraft: 'C172 - ZK-ABC',
      member: 'John Smith',
      startTime: '09:00',
      endTime: '11:00',
      type: 'Training',
      status: 'confirmed'
    },
    {
      id: '2',
      aircraft: 'PA28 - ZK-XYZ',
      member: 'Jane Doe',
      startTime: '11:30',
      endTime: '13:30',
      type: 'Private Hire',
      status: 'confirmed'
    },
    {
      id: '3',
      aircraft: 'C152 - ZK-DEF',
      member: 'Mike Johnson',
      startTime: '14:00',
      endTime: '15:30',
      type: 'Check Flight',
      status: 'confirmed'
    }
  ]

  const currentDefects = [
    {
      id: '1',
      aircraft: 'C172 - ZK-ABC',
      description: 'Oil pressure gauge showing intermittent readings',
      status: 'Open',
      reportedDate: '2024-03-25'
    },
    {
      id: '2',
      aircraft: 'PA28 - ZK-XYZ',
      description: 'Right main tire showing excessive wear',
      status: 'In Progress',
      reportedDate: '2024-03-24'
    },
    {
      id: '3',
      aircraft: 'C152 - ZK-DEF',
      description: 'Annual inspection due in 5 days',
      status: 'Open',
      reportedDate: '2024-03-23'
    }
  ]

  const activeFlights = bookings.filter(booking => booking.status === 'flying')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid - Moved to top */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`rounded-lg shadow p-4 ${
              index === 0 ? 'bg-blue-50' :
              index === 1 ? 'bg-indigo-50' :
              index === 2 ? 'bg-purple-50' :
              'bg-violet-50'
            }`}
          >
            <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              {stat.trend && (
                <span className={`text-sm flex items-center ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.percentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="flex gap-6">
        {/* Left column - 2/3 width */}
        <div className="w-2/3 space-y-6">
          {/* Active Flights Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Active Flights</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Aircraft</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Instructor</th>
                  <th className="pb-2">Checked Out</th>
                  <th className="pb-2">ETA</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeFlights.map((flight) => (
                  <tr key={flight.id} className="border-t">
                    <td className="py-2">{flight.aircraft}</td>
                    <td className="py-2">{flight.member}</td>
                    <td className="py-2">{flight.instructor || '-'}</td>
                    <td className="py-2">{flight.checkedOutTime}</td>
                    <td className="py-2">{flight.eta}</td>
                    <td className="py-2">
                      <div className="space-x-2">
                        <Link 
                          to={`/bookings/${flight.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </Link>
                        <Link 
                          to={`/bookings/${flight.id}/flight-details`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Check In
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Today's Bookings Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Today's Bookings</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Aircraft</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todaysBookings.map((booking) => (
                  <tr key={booking.id} className="border-t">
                    <td className="py-2">{booking.aircraft}</td>
                    <td className="py-2">{booking.member}</td>
                    <td className="py-2">{`${booking.startTime} - ${booking.endTime}`}</td>
                    <td className="py-2">
                      <Badge variant={
                        booking.type === 'Training' ? 'default' :
                        booking.type === 'Check Flight' ? 'destructive' :
                        'secondary'
                      }>
                        {booking.type}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {booking.status !== 'flying' && (
                        <Link 
                          to={`/bookings/${booking.id}/checkout`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Check Out
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="w-1/3">
          {/* Add WeatherCard at the top */}
          <WeatherCard />

          {/* Existing defects card */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Aircraft Defects</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Aircraft</th>
                  <th className="pb-2">Issue</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentDefects.map((defect) => (
                  <tr key={defect.id} className="border-t">
                    <td className="py-2">{defect.aircraft}</td>
                    <td className="py-2 max-w-[200px] truncate">{defect.description}</td>
                    <td className="py-2">
                      <Badge 
                        variant={
                          defect.status === 'Open' ? 'destructive' : 
                          defect.status === 'In Progress' ? 'default' : 
                          'secondary'
                        }
                      >
                        {defect.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 