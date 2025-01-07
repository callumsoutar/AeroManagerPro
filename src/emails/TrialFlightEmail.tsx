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

interface TrialFlightEmailProps {
  memberName: string;
  bookingDate: string;
  aircraftReg: string;
  instructorName: string;
  startTime: string;
  endTime: string;
}

export const TrialFlightEmail = ({
  memberName,
  bookingDate,
  aircraftReg,
  instructorName,
  startTime,
  endTime,
}: TrialFlightEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>✈️ Your Trial Flight is Confirmed! | Aeroclub</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Your Trial Flight is Confirmed!</Heading>
            <Text style={headerSubtitle}>Get ready for an unforgettable experience in the skies.</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Welcome, {memberName}!</Text>
            <Text style={text}>
              We are thrilled to confirm your trial flight. Here are the details of your upcoming adventure:
            </Text>

            <Section style={details}>
              <table style={detailsTable}>
                <tr>
                  <td style={labelCell}>📅 Date</td>
                  <td style={valueCell}>{format(new Date(bookingDate), 'dd MMM yyyy')}</td>
                </tr>
                <tr>
                  <td style={labelCell}>🕒 Time</td>
                  <td style={valueCell}>{startTime} - {endTime}</td>
                </tr>
                <tr>
                  <td style={labelCell}>✈️ Aircraft</td>
                  <td style={valueCell}>{aircraftReg}</td>
                </tr>
                <tr>
                  <td style={labelCell}>👨‍✈️ Instructor</td>
                  <td style={valueCell}>{instructorName}</td>
                </tr>
              </table>
            </Section>

            <Section style={infoBox}>
              <Heading as="h3" style={infoTitle}>Useful Information</Heading>
              <Text style={infoText}>
                ✔ Wear comfortable clothing and closed-toe shoes<br />
                ✔ Family and friends are welcome to watch from our viewing area<br />
                ✔ Complimentary tea and coffee are available in our lounge
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button href="mailto:contact@aeroclub.com" style={buttonStyle}>
                Contact Us
              </Button>
            </Section>

            <Hr style={hr} />

            <Section style={footer}>
              <Text style={footerText}>
                Need to make changes? <span style={highlight}>Contact us</span> anytime.
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

// Styles from your HTML, converted to React Email format
const main = {
  backgroundColor: '#F9F9F9',
  fontFamily: 'Arial, sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#1A1A2E',
  padding: '40px 20px',
  textAlign: 'center' as const,
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

const details = {
  backgroundColor: '#FAFAFA',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCell = {
  padding: '8px 0',
  color: '#6B7280',
  fontSize: '14px',
  fontWeight: '600',
  width: '140px',
};

const valueCell = {
  padding: '8px 0',
  color: '#111827',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'right' as const,
};

const infoBox = {
  backgroundColor: '#EFF6FF',
  borderLeft: '5px solid #6883BA',
  padding: '20px',
  margin: '20px 0',
  borderRadius: '8px',
};

const infoTitle = {
  color: '#1A1A2E',
  fontSize: '18px',
  margin: '0 0 8px',
};

const infoText = {
  color: '#4F566B',
  fontSize: '14px',
  margin: '0',
  lineHeight: '24px',
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
};

const hr = {
  borderColor: '#E5E7EB',
  margin: '32px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px',
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

export default TrialFlightEmail; 