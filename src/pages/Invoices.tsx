import React, { useState } from 'react'
import { useInvoices } from '../hooks/useInvoices'
import { useNavigate } from 'react-router-dom'
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
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { format } from 'date-fns'
import { FileText, Search } from 'lucide-react'

function getStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Filter invoices based on search term and active tab
  const filteredInvoices = invoices?.filter(invoice => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      (invoice.invoice_number?.toLowerCase() || '').includes(searchLower) ||
      (invoice.user?.name?.toLowerCase() || '').includes(searchLower) ||
      (invoice.booking?.aircraft?.registration?.toLowerCase() || '').includes(searchLower)
    )

    // Filter by tab
    switch (activeTab) {
      case 'unpaid':
        return matchesSearch && invoice.status === 'pending'
      case 'overdue':
        return matchesSearch && invoice.status === 'overdue'
      case 'paid':
        return matchesSearch && invoice.status === 'paid'
      default:
        return matchesSearch
    }
  })

  // Calculate totals for each tab
  const totals = invoices?.reduce((acc, invoice) => {
    if (invoice.status === 'pending') acc.unpaid++
    if (invoice.status === 'overdue') acc.overdue++
    if (invoice.status === 'paid') acc.paid++
    acc.all++
    return acc
  }, { all: 0, unpaid: 0, overdue: 0, paid: 0 })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button 
            className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white"
            onClick={() => navigate('/invoices/create')}
          >
            <FileText className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="relative">
            All
            <Badge variant="secondary" className="ml-2 bg-gray-100">
              {totals?.all || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unpaid" className="relative">
            Unpaid
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
              {totals?.unpaid || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="relative">
            Overdue
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
              {totals?.overdue || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paid" className="relative">
            Paid
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              {totals?.paid || 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {['all', 'unpaid', 'overdue', 'paid'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Flight</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices?.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>{invoice.user?.name || '-'}</TableCell>
                        <TableCell>
                          {invoice.booking ? (
                            <div>
                              <div>{invoice.booking.aircraft?.registration}</div>
                              <div className="text-sm text-gray-500">
                                {invoice.booking.flight_type?.name}
                              </div>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.due_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost"
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 