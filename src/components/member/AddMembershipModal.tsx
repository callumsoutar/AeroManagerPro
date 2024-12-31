import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { format } from 'date-fns'

interface AddMembershipModalProps {
  open: boolean
  onClose: () => void
  userId: string
}

interface MembershipType {
  id: string
  name: string
  yearly_fee: number
}

type PaymentStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled'

export function AddMembershipModal({ open, onClose, userId }: AddMembershipModalProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([])
  const [formData, setFormData] = useState({
    membership_type_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    async function fetchMembershipTypes() {
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .order('yearly_fee', { ascending: true })

      if (!error && data) {
        setMembershipTypes(data)
      }
    }

    if (open) {
      fetchMembershipTypes()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, set all existing memberships to inactive
      const { error: updateError } = await supabase
        .from('memberships')
        .update({ is_active: false })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating existing memberships:', updateError)
        throw updateError
      }

      // Get the selected membership type for the yearly fee
      const selectedType = membershipTypes.find(t => t.id === formData.membership_type_id)
      if (!selectedType) {
        throw new Error('Selected membership type not found')
      }

      // Create the new membership with all required fields
      const newMembership = {
        id: crypto.randomUUID(),
        user_id: userId,
        membership_type_id: formData.membership_type_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: true,
        yearly_fee: selectedType.yearly_fee,
        payment_status: 'unpaid' as PaymentStatus,
        payment_date: null,
        created_at: new Date().toISOString()
      }

      const { data, error: insertError } = await supabase
        .from('memberships')
        .insert([newMembership])
        .select(`
          *,
          membership_types (
            id,
            name,
            yearly_fee
          )
        `)

      if (insertError) {
        console.error('Error details:', insertError)
        throw insertError
      }

      console.log('Successfully added membership:', data)
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      onClose()
    } catch (error) {
      console.error('Error adding membership:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedFee = membershipTypes.find(t => t.id === formData.membership_type_id)?.yearly_fee || 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Membership</DialogTitle>
          <DialogDescription>
            Create a new membership for this member. This will deactivate any existing memberships.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="membership_type_id">Membership Type</Label>
              <select
                id="membership_type_id"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.membership_type_id}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  membership_type_id: e.target.value
                }))}
                required
              >
                <option value="">Select membership type</option>
                {membershipTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - ${type.yearly_fee}/year
                  </option>
                ))}
              </select>
            </div>

            {selectedFee > 0 && (
              <div className="text-sm text-gray-500">
                Yearly fee: ${selectedFee}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <input
                id="start_date"
                type="date"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <input
                id="end_date"
                type="date"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Membership"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 