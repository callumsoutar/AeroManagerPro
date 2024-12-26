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
import { Button } from "../components/ui/button"
import { members, Member } from '../data/members'
import { Link } from 'react-router-dom'
import AddMemberModal from '../components/modals/AddMemberModal'
import { PlusCircle } from 'lucide-react'

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddMember = (data: any) => {
    console.log('New member data:', data);
    // Here you would typically add the member to your data store
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white px-8 py-2.5 h-12 min-w-[160px] whitespace-nowrap"
          >
            <PlusCircle className="mr-3 h-5 w-5" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>License Type</TableHead>
              <TableHead>Last Flight</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Link 
                    to={`/members/${member.id}`}
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
                <TableCell>{member.licenseType}</TableCell>
                <TableCell>{member.lastFlight}</TableCell>
                <TableCell>
                  <Link 
                    to={`/members/${member.id}/edit`}
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

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMember}
      />
    </div>
  )
}

export default Members 