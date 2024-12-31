import React, { useState } from 'react'
import { Dialog, DialogContent } from "../ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Search } from 'lucide-react'
import { cn } from "../../lib/utils"
import { ALL_LESSONS } from '../../data/lessons'
import { aircraftRates, ChargeRateType } from '../../data/chargeRates'
import { aircraftData } from '../../data/aircraft'

interface NewBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface VoucherState {
  code: string;
  isValid?: boolean;
  isChecking: boolean;
}

const trialFlightOptions = [
  { id: '1', name: '2-seater 30-mins Trial', duration: 30 },
  { id: '2', name: '4-seater 30-mins Trial', duration: 30 },
  { id: '3', name: '4-seater 60-mins Trial', duration: 60 },
]

const NewBookingModal = ({ isOpen, onClose }: NewBookingModalProps) => {
  const [voucher, setVoucher] = useState<VoucherState>({
    code: '',
    isChecking: false
  })
  const [selectedAircraft, setSelectedAircraft] = useState<string>('')
  const [selectedRate, setSelectedRate] = useState<ChargeRateType | ''>('')

  const currentAircraftRates = selectedAircraft
    ? aircraftRates.find(ar => {
        const aircraftReg = selectedAircraft.split(' - ')[1]?.replace('ZK-', '')
        return ar.aircraftId === aircraftReg
      })?.rates
    : []

  const handleVoucherValidation = async () => {
    setVoucher(prev => ({ ...prev, isChecking: true }))
    // Simulate API call
    setTimeout(() => {
      setVoucher(prev => ({
        ...prev,
        isChecking: false,
        isValid: prev.code === 'VALID123' // This is just for demo
      }))
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <Tabs defaultValue="member" className="w-full">
          <div className="border-b px-6 py-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger 
                value="member"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                Member Booking
              </TabsTrigger>
              <TabsTrigger 
                value="trial"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                Trial Flight
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <TabsContent value="member" className="mt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aircraft</Label>
                    <Select
                      value={selectedAircraft}
                      onValueChange={(value) => {
                        setSelectedAircraft(value)
                        setSelectedRate('') // Reset rate when aircraft changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select aircraft" />
                      </SelectTrigger>
                      <SelectContent>
                        {aircraftData.map(aircraft => (
                          <SelectItem 
                            key={aircraft.id} 
                            value={`${aircraft.type} - ZK-${aircraft.registration}`}
                          >
                            {aircraft.type} - ZK-{aircraft.registration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Flight Type</Label>
                    <Select
                      value={selectedRate}
                      onValueChange={(value: string) => {
                        setSelectedRate(value as ChargeRateType)
                      }}
                      disabled={!selectedAircraft}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          selectedAircraft 
                            ? "Select flight type" 
                            : "Select aircraft first"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {currentAircraftRates?.map((rate) => (
                          <SelectItem key={rate.type} value={rate.type}>
                            {rate.type} - ${rate.rate}/hr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lesson (Optional)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lesson" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {ALL_LESSONS.map((lesson) => (
                          <SelectItem key={lesson} value={lesson}>
                            {lesson}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Resource</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Simulator</SelectItem>
                        <SelectItem value="room1">Briefing Room 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mike">Mike Wilson</SelectItem>
                      <SelectItem value="sarah">Sarah Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Member</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="Search members..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Flight Description</Label>
                  <Textarea placeholder="Brief description of the flight..." />
                </div>

                <div className="space-y-2">
                  <Label>Comments</Label>
                  <Textarea placeholder="Any additional comments..." />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trial" className="mt-0">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Flight Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date/Time</Label>
                      <Input type="datetime-local" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date/Time</Label>
                      <Input type="datetime-local" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Aircraft</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aircraft" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="c172">C172 - ZK-ABC</SelectItem>
                          <SelectItem value="pa28">PA28 - ZK-XYZ</SelectItem>
                          <SelectItem value="c152">C152 - ZK-DEF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Instructor</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mike">Mike Wilson</SelectItem>
                          <SelectItem value="sarah">Sarah Brown</SelectItem>
                          <SelectItem value="john">John Smith</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Trial Flight Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trial flight package" />
                      </SelectTrigger>
                      <SelectContent>
                        {trialFlightOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Gift Voucher Code (Optional)</Label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          value={voucher.code}
                          onChange={(e) => setVoucher(prev => ({ 
                            ...prev, 
                            code: e.target.value.toUpperCase(),
                            isValid: undefined 
                          }))}
                          placeholder="Enter voucher code if available"
                          className={cn(
                            "font-mono uppercase",
                            voucher.isValid === true && "border-green-500 bg-green-50",
                            voucher.isValid === false && "border-red-500 bg-red-50"
                          )}
                        />
                      </div>
                      <Button
                        onClick={handleVoucherValidation}
                        disabled={!voucher.code || voucher.isChecking}
                        className="min-w-[100px]"
                      >
                        {voucher.isChecking ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Validate'
                        )}
                      </Button>
                    </div>
                    {voucher.isValid === true && (
                      <p className="text-sm text-green-600 mt-1">✓ Valid voucher code</p>
                    )}
                    {voucher.isValid === false && (
                      <p className="text-sm text-red-600 mt-1">✗ Invalid voucher code</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input placeholder="Enter first name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input placeholder="Enter last name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email" 
                          placeholder="Enter email address"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                          type="tel" 
                          placeholder="Enter phone number"
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" className="bg-white">
              Save
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save & Confirm
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default NewBookingModal 