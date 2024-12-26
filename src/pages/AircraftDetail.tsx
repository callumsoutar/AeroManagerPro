import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { aircraftData, Aircraft } from '../data/aircraft'
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table"
import { Checkbox } from "../components/ui/checkbox"
import { Plus } from 'lucide-react'
import { Badge } from "../components/ui/badge"

const AircraftDetail = () => {
  const { id } = useParams()
  const aircraft = aircraftData.find((a: Aircraft) => a.id === id)

  if (!aircraft) {
    return <div className="p-6">Aircraft not found</div>
  }

  const equipmentData = [
    { name: 'Annual', days: 120, dueHours: 1200, hoursRemaining: 45 },
    { name: '100 Hour', days: 30, dueHours: 100, hoursRemaining: 23 },
    { name: 'ARA', days: 90, dueHours: 800, hoursRemaining: 156 },
    { name: 'Transponder', days: 60, dueHours: 600, hoursRemaining: 89 },
  ]

  const defectsData = [
    { date: '2024-03-20', defect: 'Oil pressure gauge fluctuating', status: 'Open' },
    { date: '2024-03-15', defect: 'Right brake squeaking', status: 'In Progress' },
    { date: '2024-03-10', defect: 'Radio static interference', status: 'Resolved' },
  ]

  const chargeRatesData = [
    { type: 'Training', method: 'Tacho', includesFuel: true, amount: 180 },
    { type: 'Private Hire', method: 'Tacho', includesFuel: true, amount: 195 },
    { type: 'Club Member', method: 'Tacho', includesFuel: false, amount: 165 },
    { type: 'Commercial', method: 'Hobbs', includesFuel: false, amount: 220 },
  ]

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{aircraft.registration}</h1>
          <p className="text-gray-500 mt-1">{aircraft.type} - {aircraft.model}</p>
        </div>
        <Link 
          to="/aircraft"
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          ← Back to Aircraft
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Top Section with Photo and Key Details */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-3 gap-8">
            {/* Photo Section */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-64 w-full flex items-center justify-center overflow-hidden">
                {aircraft.photoUrl ? (
                  <img 
                    src={aircraft.photoUrl} 
                    alt={`${aircraft.registration} aircraft`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Aircraft Photo</span>
                )}
              </div>
              <Button variant="outline" className="w-full">
                Upload Photo
              </Button>
            </div>

            {/* Key Details */}
            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p>
                    <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                      aircraft.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {aircraft.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Engine Hours</label>
                  <p className="mt-1 text-gray-900">{aircraft.engineHours} hours</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Year</label>
                  <p className="mt-1 text-gray-900">{aircraft.year}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Maintenance</label>
                  <p className="mt-1 text-gray-900">{aircraft.lastMaintenance}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Next Service Due</label>
                  <p className="mt-1 text-gray-900">{aircraft.nextServiceDue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="p-6">
          <Tabs defaultValue="equipment" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="defects">Defects</TabsTrigger>
              <TabsTrigger value="rates">Charge Rates</TabsTrigger>
              <TabsTrigger value="techlog">Tech Log</TabsTrigger>
              <TabsTrigger value="hours">Hours Remaining</TabsTrigger>
            </TabsList>
            <TabsContent value="equipment" className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Due Hours</TableHead>
                    <TableHead>Hours Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.days}</TableCell>
                      <TableCell>{item.dueHours}</TableCell>
                      <TableCell>{item.hoursRemaining}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="defects" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Aircraft Defects</h3>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Defect
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Defect</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defectsData.map((defect, index) => (
                    <TableRow key={index}>
                      <TableCell>{defect.date}</TableCell>
                      <TableCell>{defect.defect}</TableCell>
                      <TableCell>
                        <Badge variant={
                          defect.status === 'Open' ? 'destructive' :
                          defect.status === 'In Progress' ? 'default' :
                          'secondary'
                        }>
                          {defect.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="rates" className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight Type</TableHead>
                    <TableHead>Charge Method</TableHead>
                    <TableHead>Includes Fuel</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chargeRatesData.map((rate, index) => (
                    <TableRow key={index}>
                      <TableCell>{rate.type}</TableCell>
                      <TableCell>{rate.method}</TableCell>
                      <TableCell>
                        <Checkbox 
                          checked={rate.includesFuel} 
                          disabled 
                        />
                      </TableCell>
                      <TableCell>${rate.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="techlog" className="p-4">
              <div className="text-gray-500">Tech log information will be displayed here</div>
            </TabsContent>
            <TabsContent value="hours" className="p-4">
              <div className="text-gray-500">Hours remaining information will be displayed here</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AircraftDetail 