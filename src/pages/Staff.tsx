import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Input } from "../components/ui/input"
import { staff } from '../data/staff'
import type { Staff } from '../data/staff'
import { Link } from 'react-router-dom'

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff</h1>
        <Input
          placeholder="Search staff..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Flight</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Link 
                    to={`/staff/${member.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {member.name}
                  </Link>
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>{member.joinDate}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.lastFlight}</TableCell>
                <TableCell>
                  <Link 
                    to={`/staff/${member.id}/edit`}
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default StaffPage 