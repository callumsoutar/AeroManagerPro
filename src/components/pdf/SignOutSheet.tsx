import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { BookingDetails } from '../../hooks/useBooking';

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  headerContainer: {
    marginBottom: 12,
    backgroundColor: "#ffffff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  mainTitle: {
    fontSize: 20,
    color: "#030712",
    marginBottom: 8,
    fontWeight: "bold",
  },
  flightInfoGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  flightInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 180,
  },
  label: {
    fontSize: 10,
    color: "#1f2937",
  },
  value: {
    fontSize: 10,
    color: "#030712",
    fontWeight: "medium",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#030712",
    marginBottom: 6,
    fontWeight: "bold",
  },
  table: {
    width: "auto",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    minHeight: 16,
    backgroundColor: "#ffffff",
  },
  tableCol: {
    flex: 1,
    padding: 4,
    fontSize: 9,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#1f2937",
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1f2937",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 35,
    marginTop: 5,
  },
  recordsCard: {
    width: "45%",
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 15,
    borderWidth: 1.5,
    borderColor: "#1f2937",
  },
  flightRecords: {
    marginRight: "30%",
  },
  fuelRecords: {
    marginLeft: "30%",
  },
  cardTitle: {
    fontSize: 14,
    color: "#030712",
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: "#1f2937",
  },
  twoColumnContainer: {
    flexDirection: "row",
    gap: 20,
  },
  column: {
    flex: 1,
  },
  row: {
    marginBottom: 10,
  },
  lineValue: {
    fontSize: 10,
    color: "#030712",
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    paddingVertical: 4,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#1f2937",
    textAlign: "center",
  },
});

interface SignOutSheetProps {
  booking: BookingDetails;
}

export const SignOutSheet: React.FC<SignOutSheetProps> = ({ booking }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>Flight Sign Out Sheet</Text>
        <View style={styles.flightInfoGrid}>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Student:</Text>
            <Text style={styles.value}>
              {booking?.user
                ? `${booking.user.first_name} ${booking.user.last_name}`
                : "-"}
            </Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Instructor:</Text>
            <Text style={styles.value}>{booking?.instructor?.name || "-"}</Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Aircraft:</Text>
            <Text style={styles.value}>
              {booking?.aircraft?.registration || "-"}
            </Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {booking?.start_time
                ? format(new Date(booking.start_time), "dd MMM yyyy")
                : "-"}
            </Text>
          </View>
          <View style={styles.flightInfoItem}>
            <Text style={styles.label}>Lesson:</Text>
            <Text style={styles.value}>{booking?.lesson?.name || "-"}</Text>
          </View>
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
          {Array.from({ length: 5 }).map((_, rowIndex) => (
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

      {/* Bottom Section with Records and Fuel */}
      <View style={styles.bottomContainer}>
        <View style={[styles.recordsCard, styles.flightRecords]}>
          <Text style={styles.cardTitle}>Flight Records</Text>
          <View style={styles.twoColumnContainer}>
            <View style={styles.column}>
              {["Tacho Start", "Tacho End", "Hobbs Start", "Hobbs End"].map(
                (label) => (
                  <View key={label} style={styles.row}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.lineValue}></Text>
                  </View>
                )
              )}
            </View>
            <View style={styles.column}>
              {["Solo Time", "Dual Time", "Total Time", "Night Time"].map(
                (label) => (
                  <View key={label} style={styles.row}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.lineValue}></Text>
                  </View>
                )
              )}
            </View>
          </View>
        </View>

        <View style={[styles.recordsCard, styles.fuelRecords]}>
          <Text style={styles.cardTitle}>Fuel</Text>
          {["Total Fuel", "Useable Fuel", "Safe Endurance"].map((label) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.lineValue}></Text>
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

export default SignOutSheet; 