import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { 
  PRIME_RATINGS, 
  TYPE_RATINGS, 
  ENDORSEMENTS,
  PrimeRatingType,
  TypeRatingType,
  EndorsementType 
} from '../../types/ratings'

interface EditPilotDetailsModalProps {
  open: boolean
  onClose: () => void
  user: {
    id: string
    license_type: string | null
    caa_client_number: string | null
    bfr_expiry: string | null
    dl9_medical_due: string | null
    class2_medical_due: string | null
    prime_ratings: PrimeRatingType[]
    type_ratings: TypeRatingType[]
    endorsements: EndorsementType[]
  }
}

// Update the toggleArrayItem function to be type-safe
function toggleArrayItem<T extends string>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter(i => i !== item)
    : [...array, item]
}

interface FormData {
  license_type: string
  caa_client_number: string
  bfr_expiry: string
  dl9_medical_due: string | null
  class2_medical_due: string | null
  prime_ratings: PrimeRatingType[]
  type_ratings: TypeRatingType[]
  endorsements: EndorsementType[]
}

export function EditPilotDetailsModal({ open, onClose, user }: EditPilotDetailsModalProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    license_type: user.license_type || '',
    caa_client_number: user.caa_client_number || '',
    bfr_expiry: user.bfr_expiry || '',
    dl9_medical_due: user.dl9_medical_due,
    class2_medical_due: user.class2_medical_due,
    prime_ratings: user.prime_ratings || [],
    type_ratings: user.type_ratings || [],
    endorsements: user.endorsements || []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create update object with only non-empty values
      const updateData = {
        license_type: formData.license_type || null,
        caa_client_number: formData.caa_client_number || null,
        bfr_expiry: formData.bfr_expiry || null,
        dl9_medical_due: formData.dl9_medical_due || null,
        class2_medical_due: formData.class2_medical_due || null,
        prime_ratings: formData.prime_ratings,
        type_ratings: formData.type_ratings,
        endorsements: formData.endorsements
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['user', user.id] })
      onClose()
    } catch (error) {
      console.error('Error updating pilot details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Pilot Details</DialogTitle>
          <DialogDescription>
            Update pilot qualifications and medical information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* License Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="license_type">License Type</Label>
                <input
                  id="license_type"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.license_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_type: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caa_client_number">CAA Client Number</Label>
                <input
                  id="caa_client_number"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.caa_client_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, caa_client_number: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bfr_expiry">BFR Expiry</Label>
                <input
                  id="bfr_expiry"
                  type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.bfr_expiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, bfr_expiry: e.target.value }))}
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dl9_medical_due">DL9 Medical Due</Label>
                <input
                  id="dl9_medical_due"
                  type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.dl9_medical_due || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dl9_medical_due: e.target.value || null
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class2_medical_due">Class 2 Medical Due</Label>
                <input
                  id="class2_medical_due"
                  type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.class2_medical_due || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    class2_medical_due: e.target.value || null
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Ratings and Endorsements */}
          <div className="grid grid-cols-3 gap-6">
            {/* Prime Ratings */}
            <div className="space-y-4">
              <Label>Prime Ratings</Label>
              <div className="space-y-2">
                {PRIME_RATINGS.map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`prime-${rating}`}
                      checked={formData.prime_ratings.includes(rating)}
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          prime_ratings: toggleArrayItem<PrimeRatingType>(prev.prime_ratings, rating)
                        }))
                      }}
                    />
                    <label
                      htmlFor={`prime-${rating}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {rating}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Ratings */}
            <div className="space-y-4">
              <Label>Type Ratings</Label>
              <div className="space-y-2">
                {TYPE_RATINGS.map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${rating}`}
                      checked={formData.type_ratings.includes(rating)}
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          type_ratings: toggleArrayItem<TypeRatingType>(prev.type_ratings, rating)
                        }))
                      }}
                    />
                    <label
                      htmlFor={`type-${rating}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {rating}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Endorsements */}
            <div className="space-y-4">
              <Label>Endorsements</Label>
              <div className="space-y-2">
                {ENDORSEMENTS.map((endorsement) => (
                  <div key={endorsement} className="flex items-center space-x-2">
                    <Checkbox
                      id={`endorsement-${endorsement}`}
                      checked={formData.endorsements.includes(endorsement)}
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          endorsements: toggleArrayItem<EndorsementType>(prev.endorsements, endorsement)
                        }))
                      }}
                    />
                    <label
                      htmlFor={`endorsement-${endorsement}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {endorsement}
                    </label>
                  </div>
                ))}
              </div>
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 