import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import { format } from 'date-fns';

interface BookingConfirmationEmailProps {
  memberName: string;
  bookingDate: string;
  aircraftReg: string;
  instructorName?: string;
  startTime: string;
  endTime: string;
  flightType: string;
}

export const BookingConfirmationEmail = ({
  memberName,
  bookingDate,
  aircraftReg,
  instructorName,
  startTime,
  endTime,
  flightType,
}: BookingConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>✈️ Your flight booking is confirmed | Aeroclub</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <div style={logo}></div>
            <Heading style={headerTitle}>Flight Booking Confirmed</Heading>
            <Text style={headerSubtitle}>We're excited to see you in the skies!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hello {memberName},</Text>
            <Text style={text}>
              Your flight booking has been confirmed. Here's everything you need to know:
            </Text>

            <table style={detailsTable}>
              <tr style={detailRow}>
                <td style={labelCell}>📅 Date</td>
                <td style={valueCell}>{format(new Date(bookingDate), 'dd MMM yyyy')}</td>
              </tr>
              
              <tr style={detailRow}>
                <td style={labelCell}>✈️ Aircraft</td>
                <td style={valueCell}>{aircraftReg}</td>
              </tr>

              <tr style={detailRow}>
                <td style={labelCell}>🕒 Time</td>
                <td style={valueCell}>{startTime} - {endTime}</td>
              </tr>

              {instructorName && (
                <tr style={detailRow}>
                  <td style={labelCell}>👨‍✈️ Instructor</td>
                  <td style={valueCell}>{instructorName}</td>
                </tr>
              )}

              <tr style={detailRow}>
                <td style={labelCell}>🎯 Flight Type</td>
                <td style={valueCell}>{flightType}</td>
              </tr>
            </table>

            <Section style={buttonContainer}>
              <Button href="#" style={buttonStyle}>
                View Full Details →
              </Button>
            </Section>

            <Section style={infoBox}>
              <Heading as="h3" style={infoTitle}>Important Information</Heading>
              <Text style={infoText}>
                • Please arrive 30 minutes before your scheduled time<br />
                • Don't forget to bring your pilot's license and medical<br />
                • Weather briefing will be available upon arrival
              </Text>
            </Section>

            <Hr style={hr} />

            <Section style={footer}>
              <Text style={footerText}>
                Need to make changes? <span style={highlight}>Contact us</span> or visit our website.
              </Text>
              <Text style={footerText}>
                Clear skies,<br />
                <span style={highlight}>The Aeroclub Team</span>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Updated styles
const main = {
  backgroundColor: '#F9F9F9',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  width: '100%',
};

const header = {
  backgroundColor: '#1A1A2E',
  padding: '40px 20px',
  textAlign: 'center' as const,
};

const logo = {
  width: '180px',
  height: '60px',
  margin: '0 auto 24px',
  backgroundColor: '#6883BA',
  borderRadius: '8px',
};

const headerTitle = {
  color: '#F9F9F9',
  fontSize: '32px',
  margin: '0 0 8px',
  lineHeight: '40px',
  fontWeight: 'bold',
};

const headerSubtitle = {
  color: '#6883BA',
  fontSize: '16px',
  margin: '0',
  lineHeight: '24px',
};

const content = {
  padding: '40px 20px',
};

const greeting = {
  color: '#1A1A2E',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  lineHeight: '32px',
};

const text = {
  color: '#4F566B',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  margin: '20px 0',
};

const detailRow = {
  borderBottom: '1px solid #E5E7EB',
};

const labelCell = {
  padding: '16px',
  color: '#6B7280',
  fontSize: '14px',
  fontWeight: '600',
  width: '140px',
};

const valueCell = {
  padding: '16px',
  color: '#111827',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'right' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const buttonStyle = {
  backgroundColor: '#1A1A2E',
  color: '#FFFFFF',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
};

const infoBox = {
  backgroundColor: '#FAFAFA',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#1A1A2E',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  lineHeight: '28px',
};

const infoText = {
  color: '#4F566B',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const hr = {
  borderColor: '#E5E7EB',
  margin: '32px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const highlight = {
  color: '#6883BA',
  fontWeight: '600',
};

export default BookingConfirmationEmail;