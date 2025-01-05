import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { format } from 'date-fns';
import type { BookingDetails } from '../../hooks/useBooking';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column' as const,
    backgroundColor: "#ffffff",
    padding: 30,
  },
  headerContainer: {
    marginBottom: 20,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  mainTitle: {
    fontSize: 18,
    color: "#000000",
    marginBottom: 12,
    fontWeight: "bold",
  },
  flightInfoGrid: {
    flexDirection: "row" as const,
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  flightInfoItem: {
    flexDirection: "row" as const,
    alignItems: "center",
    gap: 4,
    minWidth: 180,
  },
  label: {
    fontSize: 9,
    color: "#4b5563",
  },
  value: {
    fontSize: 9,
    color: "#000000",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 8,
    fontWeight: "bold",
  },
  table: {
    width: "auto",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row" as const,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    minHeight: 28,
  },
  tableCol: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
  },
  detailsGrid: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 12,
  },
  detailsCard: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  detailsTitle: {
    fontSize: 11,
    color: "#000000",
    fontWeight: "bold",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  detailsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  detailValue: {
    fontSize: 10,
    color: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    minWidth: 100,
    textAlign: "center",
    paddingVertical: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: "#4b5563",
    textAlign: "center",
  },
});

interface SignOutSheetProps {
  booking: BookingDetails;
}

export default function SignOutSheet({ booking }: SignOutSheetProps) {
  return (
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
            {booking.lesson && (
              <View style={styles.flightInfoItem}>
                <Text style={styles.label}>Lesson:</Text>
                <Text style={styles.value}>{booking.lesson.name}</Text>
              </View>
            )}
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
} 