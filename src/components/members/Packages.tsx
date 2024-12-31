import React from 'react'
import { Progress } from "../ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Package, PackageItem } from '../../data/packages'
import { format } from 'date-fns'

interface PackagesProps {
  packages: Package[];
}

function formatValue(item: PackageItem): string {
  if (item.type === 'currency') {
    return `$${item.usedValue.toLocaleString()}/$${item.totalValue.toLocaleString()}`
  }
  return `${item.usedValue}/${item.totalValue}`
}

function calculateProgress(item: PackageItem): number {
  return (item.usedValue / item.totalValue) * 100
}

export function Packages({ packages }: PackagesProps) {
  return (
    <div className="space-y-6">
      {packages.map((pkg) => (
        <div key={pkg.id} className="bg-white rounded-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{pkg.name}</h3>
              <p className="text-sm text-gray-500">
                Expires {format(new Date(pkg.expiryDate), 'dd MMM yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 
                  pkg.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'}`}>
                {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
              </span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="w-[60%]">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pkg.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={calculateProgress(item)} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {formatValue(item)}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
} 