import React from 'react'
import { useAircraft } from '../hooks/useAircraft'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { PlusCircle } from 'lucide-react'
import { Badge } from '../components/ui/badge'

const AircraftPage = () => {
  const { data: aircraft, isLoading } = useAircraft()
  const [searchTerm, setSearchTerm] = React.useState('')

  const filteredAircraft = aircraft?.filter(aircraft =>
    aircraft.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aircraft.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aircraft.model.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? []

  if (isLoading) {
    return <div className="p-6">Loading aircraft...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Aircraft</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search aircraft..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white px-8 py-2.5 h-12 min-w-[160px] whitespace-nowrap"
          >
            <PlusCircle className="mr-3 h-5 w-5" />
            Add Aircraft
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engine Hours</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAircraft.map((aircraft) => (
              <TableRow key={aircraft.id}>
                <TableCell>
                  <Link
                    to={`/aircraft/${aircraft.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {aircraft.registration}
                  </Link>
                </TableCell>
                <TableCell>{aircraft.type}</TableCell>
                <TableCell>{aircraft.model}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      aircraft.status === 'Active' ? 'bg-green-100 text-green-800' :
                      aircraft.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {aircraft.status}
                  </Badge>
                </TableCell>
                <TableCell>{aircraft.engine_hours}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    className="hover:text-[#1a1a2e] px-6 py-2"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AircraftPage 