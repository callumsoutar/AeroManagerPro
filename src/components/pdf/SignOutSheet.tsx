import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from 'date-fns';
import type { BookingDetails } from '../../hooks/useBooking';

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 25,
  },
  headerContainer: {
    marginBottom: 15,
    backgroundColor: "#ffffff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  mainTitle: {
    fontSize: 22,
    color: "#111827",
    marginBottom: 10,
    fontWeight: "bold",
  },
  flightInfoGrid: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  flightInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 180,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
  },
  value: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "medium",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 6,
    fontWeight: "bold",
  },
  table: {
    width: "auto",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 24,
    backgroundColor: "#ffffff",
  },
  tableCol: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 14,
    marginTop: 14,
  },
  detailsCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailsTitle: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  detailValue: {
    fontSize: 10,
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minWidth: 120,
    textAlign: "center",
    paddingVertical: 2,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 25,
    right: 25,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
});

interface SignOutSheetProps {
  booking: BookingDetails;
}

export const SignOutSheet = ({ booking }: SignOutSheetProps) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>Flight Sign Out Sheet</Text>
        <View style={styles.flightInfoGrid}>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Student:</Text>
            <Text style={styles.value}>
              {booking.user ? `${booking.user.first_name} ${booking.user.last_name}` : '-'}
            </Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Instructor:</Text>
            <Text style={styles.value}>{booking.instructor?.name || '-'}</Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Aircraft:</Text>
            <Text style={styles.value}>{booking.aircraft?.registration || '-'}</Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {format(new Date(booking.start_time), 'dd MMM yyyy')}
            </Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Lesson:</Text>
            <Text style={styles.value}>{booking.lesson?.name || '-'}</Text>
          </View>
          {booking.description && (
            <View style={styles.flightInfoItem}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{booking.description}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Navigation Log */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Log</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            {[
              "From",
              "To",
              "Alt",
              "TAS",
              "TT",
              "Wind Dir",
              "Speed",
              "Var",
              "Mag H",
              "Dist",
              "GS",
              "Time",
              "Dest Elv",
              "ETA",
              "Actual",
            ].map((header, index) => (
              <View key={index} style={styles.tableCol}>
                <Text style={styles.tableHeaderCell}>{header}</Text>
              </View>
            ))}
          </View>
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {Array.from({ length: 15 }).map((_, colIndex) => (
                <View key={colIndex} style={styles.tableCol}>
                  <Text> </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Flight Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Time Records</Text>
          {[
            ["Tacho Start", ""],
            ["Tacho End", ""],
            ["Hobbs Start", ""],
            ["Hobbs End", ""],
          ].map(([label, value], index) => (
            <View key={index} style={styles.detailsRow}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Flight Duration</Text>
          {[
            ["Solo Time", ""],
            ["Dual Time", ""],
            ["Total Time", ""],
            ["Night Time", ""],
          ].map(([label, value], index) => (
            <View key={index} style={styles.detailsRow}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Fuel</Text>
          {[
            ["Total Fuel", ""],
            ["Useable Fuel", ""],
            ["Safe Endurance", ""],
          ].map(([label, value], index) => (
            <View key={index} style={styles.detailsRow}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This document is property of the Aeroclub. Please submit a copy to the
          operations desk after completion.
        </Text>
      </View>
    </Page>
  </Document>
); 