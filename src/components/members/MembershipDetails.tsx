import React from 'react'
import { Button } from "../ui/button"
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Badge } from "../ui/badge"
import { Member } from '../../data/members'

interface MembershipDetailsProps {
  member: Member;
}


const MembershipDetails = ({ member }: MembershipDetailsProps) => {
  const currentMembership = member.memberships.find(m => m.isActive)

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy')
  }

  return (
    <div className="space-y-6">
      {/* Current Membership Status */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Current Membership</h3>
        {currentMembership ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{currentMembership.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p className="font-medium">{formatDate(currentMembership.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${
                member.isMember ? 
                'bg-green-500 text-white hover:bg-green-500/80' : 
                'bg-gray-200 text-gray-700 hover:bg-gray-200/80'
              }`}>
                {member.isMember ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Yearly Fee</p>
              <p className="font-medium">${currentMembership.yearlyFee}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No active membership</p>
        )}
      </div>

      {/* Membership History */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Membership History</h3>
          <Button 
            onClick={() => {
              console.log('Add membership clicked')
              // We'll implement this later
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Membership
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {member.memberships.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell>{membership.type}</TableCell>
                <TableCell>{formatDate(membership.startDate)}</TableCell>
                <TableCell>{formatDate(membership.endDate)}</TableCell>
                <TableCell>
                  <Badge variant={membership.isActive ? 'default' : 'secondary'}>
                    {membership.isActive ? 'Active' : 'Expired'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={membership.paymentStatus === 'Paid' ? 'default' : 
                            membership.paymentStatus === 'Pending' ? 'secondary' : 
                            'destructive'}
                  >
                    {membership.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>${membership.yearlyFee}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default MembershipDetails 