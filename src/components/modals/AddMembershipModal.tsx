import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { format } from 'date-fns'
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"

const membershipSchema = z.object({
  type: z.enum(['Flying Member', 'Non-Flying Member', 'Senior Member', 'Staff Member'] as const),
  startDate: z.string(),
  endDate: z.string(),
  yearlyFee: z.number().min(0),
  paymentStatus: z.enum(['Paid', 'Pending', 'Overdue'] as const),
  paymentDate: z.string().optional(),
})

export type MembershipFormData = z.infer<typeof membershipSchema>

interface AddMembershipModalProps {
  isOpen: boolean
  onClose: () => void
  memberId: string
  onSubmit: (data: MembershipFormData) => void
}

type FieldType = {
  onChange: (...event: any[]) => void;
  value: any;
}

const AddMembershipModal = ({ isOpen, onClose, memberId, onSubmit }: AddMembershipModalProps) => {
  const form = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      type: 'Flying Member',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().getFullYear() + 1, 2, 31), 'yyyy-MM-dd'), // Next March 31st
      yearlyFee: 150,
      paymentStatus: 'Pending',
    }
  })

  const handleSubmit = (data: MembershipFormData) => {
    onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Membership</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }: { field: FieldType }) => (
                <FormItem>
                  <FormLabel>Membership Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select membership type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Flying Member">Flying Member</SelectItem>
                      <SelectItem value="Non-Flying Member">Non-Flying Member</SelectItem>
                      <SelectItem value="Senior Member">Senior Member</SelectItem>
                      <SelectItem value="Staff Member">Staff Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }: { field: FieldType }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }: { field: FieldType }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearlyFee"
              render={({ field }: { field: FieldType }) => (
                <FormItem>
                  <FormLabel>Yearly Fee</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }: { field: FieldType }) => (
                <FormItem>
                  <FormLabel>Payment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit">Add Membership</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddMembershipModal 