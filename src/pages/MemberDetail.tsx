import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { members, Member } from '../data/members'
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"

const MemberDetail = () => {
  const { id } = useParams()
  const member = members.find((m: Member) => m.id === id)

  if (!member) {
    return <div className="p-6">Member not found</div>
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
          <p className="text-gray-500 mt-1">Member #{member.membershipNumber}</p>
        </div>
        <Link 
          to="/members"
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          ← Back to Members
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
                {member.photoUrl ? (
                  <img 
                    src={member.photoUrl} 
                    alt={`${member.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">Member Photo</span>
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
                      member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="mt-1 text-gray-900">{member.joinDate}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Membership Type</label>
                  <p className="mt-1 text-gray-900">{member.membershipType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">License Type</label>
                  <p className="mt-1 text-gray-900">{member.licenseType}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="p-6">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="membership">Membership Details</TabsTrigger>
              <TabsTrigger value="pilot">Pilot Details</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="history">Flight History</TabsTrigger>
              <TabsTrigger value="comments">Instructor Comments</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
            <TabsContent value="contact" className="p-4">
              <div className="text-gray-500">Contact details will be displayed here</div>
            </TabsContent>
            <TabsContent value="membership" className="p-4">
              <div className="text-gray-500">Membership details will be displayed here</div>
            </TabsContent>
            <TabsContent value="pilot" className="p-4">
              <div className="text-gray-500">Pilot details will be displayed here</div>
            </TabsContent>
            <TabsContent value="account" className="p-4">
              <div className="text-gray-500">Account information will be displayed here</div>
            </TabsContent>
            <TabsContent value="bookings" className="p-4">
              <div className="text-gray-500">Bookings will be displayed here</div>
            </TabsContent>
            <TabsContent value="history" className="p-4">
              <div className="text-gray-500">Flight history will be displayed here</div>
            </TabsContent>
            <TabsContent value="comments" className="p-4">
              <div className="text-gray-500">Instructor comments will be displayed here</div>
            </TabsContent>
            <TabsContent value="permissions" className="p-4">
              <div className="text-gray-500">Permissions will be displayed here</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default MemberDetail 