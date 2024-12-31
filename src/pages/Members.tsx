import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { useUsers } from '../hooks/useUsers'
import { format } from 'date-fns'
import { AddMemberModal } from "../components/member/AddMemberModal"
import { Plus } from "lucide-react"
import { getFullName } from '../lib/utils'
import { Input } from "../components/ui/input"

const Members = () => {
  const navigate = useNavigate()
  const { data: users, isLoading } = useUsers()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users?.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRowClick = (userId: string) => {
    navigate(`/members/${userId}`)
  }

  if (isLoading) {
    return <div className="p-6">Loading members...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Member Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Last Flight</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow 
                key={user.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(user.id)}
              >
                <TableCell className="font-medium">
                  {getFullName(user.first_name, user.last_name)}
                </TableCell>
                <TableCell>{user.user_number}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(user.join_date), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  {user.last_flight ? format(new Date(user.last_flight), 'dd MMM yyyy') : '-'}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    className="hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent row click when clicking the button
                      navigate(`/members/${user.id}`)
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddMemberModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}

export default Members 