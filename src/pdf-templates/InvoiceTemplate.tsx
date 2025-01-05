import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#666',
  },
  companyDetails: {
    fontSize: 10,
    color: '#666',
  },
  dates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billTo: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  table: {
    flexDirection: 'column',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
  },
  description: { flex: 2 },
  quantity: { flex: 1, textAlign: 'right' },
  rate: { flex: 1, textAlign: 'right' },
  amount: { flex: 1, textAlign: 'right' },
  totals: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginBottom: 8,
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
  },
})

interface InvoiceTemplateProps {
  invoice: {
    id: string
    invoice_number: string
    total_amount: number
    status: string
    due_date: string
    created_at: string
    flight_charges: Array<{
      description: string
      rate: number
      units: number
      amount: number
    }> | null
    additional_charges: Array<{
      description: string
      amount: number
      quantity: number
      total: number
    }> | null
    user?: {
      name: string
      email: string
      address: string
      city: string
    }
    booking?: {
      aircraft?: {
        registration: string
        type: string
      }
    }
  }
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoice }) => {
  const flightChargesTotal = (invoice.flight_charges || [])
    .reduce((sum, charge) => sum + charge.amount, 0)
  
  const additionalChargesTotal = (invoice.additional_charges || [])
    .reduce((sum, charge) => sum + charge.total, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyDetails}>Your Aero Club</Text>
            <Text style={styles.companyDetails}>123 Airport Road</Text>
            <Text style={styles.companyDetails}>Auckland, New Zealand</Text>
            <Text style={styles.companyDetails}>info@aeroclub.com</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.dates}>
          <View>
            <Text>Date: {format(new Date(invoice.created_at), 'dd MMM yyyy')}</Text>
            <Text>Due Date: {format(new Date(invoice.due_date), 'dd MMM yyyy')}</Text>
          </View>
          <View>
            <Text>Status: {invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          {invoice.user && (
            <>
              <Text>{invoice.user.name}</Text>
              <Text>{invoice.user.email}</Text>
              <Text>{invoice.user.address}</Text>
              <Text>{invoice.user.city}</Text>
            </>
          )}
        </View>

        {/* Aircraft Details if available */}
        {invoice.booking?.aircraft && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Aircraft:</Text>
            <Text>{invoice.booking.aircraft.registration} - {invoice.booking.aircraft.type}</Text>
          </View>
        )}

        {/* Charges Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.quantity}>Quantity</Text>
            <Text style={styles.rate}>Rate</Text>
            <Text style={styles.amount}>Amount</Text>
          </View>

          {/* Flight Charges */}
          {(invoice.flight_charges || []).map((charge, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.description}>{charge.description}</Text>
              <Text style={styles.quantity}>{charge.units}</Text>
              <Text style={styles.rate}>${charge.rate.toFixed(2)}</Text>
              <Text style={styles.amount}>${charge.amount.toFixed(2)}</Text>
            </View>
          ))}

          {/* Additional Charges */}
          {(invoice.additional_charges || []).map((charge, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.description}>{charge.description}</Text>
              <Text style={styles.quantity}>{charge.quantity}</Text>
              <Text style={styles.rate}>
                ${(charge.amount / charge.quantity).toFixed(2)}
              </Text>
              <Text style={styles.amount}>${charge.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Flight Charges:</Text>
            <Text>${flightChargesTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Additional Charges:</Text>
            <Text>${additionalChargesTotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total:</Text>
            <Text>${invoice.total_amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text style={{ marginTop: 4 }}>
            Please make payment by {format(new Date(invoice.due_date), 'dd MMM yyyy')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default InvoiceTemplate 