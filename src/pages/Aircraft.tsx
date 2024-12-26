import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Aircraft {
  id: string;
  registration: string;
  type: string;
  model: string;
}

const aircraftData: Aircraft[] = [
  { id: 'aircraft-1', registration: 'FLC', type: 'C-152', model: 'Cessna 152' },
  { id: 'aircraft-2', registration: 'JEN', type: 'A-152', model: 'Aerobat' },
  { id: 'aircraft-3', registration: 'KID', type: 'A-152', model: 'Aerobat' },
  { id: 'aircraft-4', registration: 'ELA', type: 'C-152', model: 'Cessna 152' },
  { id: 'aircraft-5', registration: 'FPI', type: 'C-152', model: 'Cessna 152' },
  { id: 'aircraft-6', registration: 'EKM', type: 'C-152', model: 'Cessna 152' },
  { id: 'aircraft-7', registration: 'ELS', type: 'A-152', model: 'Aerobat' },
  { id: 'aircraft-8', registration: 'TDL', type: 'PA-38', model: 'Tomahawk' },
  { id: 'aircraft-9', registration: 'DRP', type: 'C172M', model: 'Skyhawk' },
  { id: 'aircraft-10', registration: 'KAZ', type: 'C-172SP', model: 'Skyhawk G1000' },
];

const AircraftPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredAircraft = aircraftData.filter(aircraft =>
    aircraft.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aircraft.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aircraft.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  );
};

export default AircraftPage; 