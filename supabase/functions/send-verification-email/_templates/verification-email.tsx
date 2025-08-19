import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface VerificationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const VerificationEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Verify your email address to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <div style={logo}>
            <span style={techWith}>Tech With</span>
            <span style={authorName}>AYUSHI AGGARWAL</span>
          </div>
        </Section>
        
        <Heading style={h1}>Welcome to Tech With Ayushi Aggarwal!</Heading>
        
        <Text style={text}>
          Hi there! Thanks for signing up. We're excited to have you join our community of learners.
        </Text>
        
        <Text style={text}>
          To get started, please verify your email address by clicking the button below:
        </Text>
        
        <Section style={buttonSection}>
          <Button
            style={button}
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          >
            Verify Email Address
          </Button>
        </Section>
        
        <Text style={text}>
          Or copy and paste this verification code if the button doesn't work:
        </Text>
        
        <Section style={codeSection}>
          <Text style={code}>{token}</Text>
        </Section>
        
        <Text style={smallText}>
          This verification link will expire in 24 hours for security reasons.
        </Text>
        
        <Text style={smallText}>
          If you didn't create this account, you can safely ignore this email.
        </Text>
        
        <Section style={footer}>
          <Text style={footerText}>
            Best regards,<br />
            The Tech With Ayushi Aggarwal Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default VerificationEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logoSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const logo = {
  display: 'inline-block',
  textAlign: 'center' as const,
}

const techWith = {
  display: 'block',
  fontSize: '28px',
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #facc15 0%, #f97316 25%, #ec4899 50%, #9333ea 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: '4px',
}

const authorName = {
  display: 'block',
  fontSize: '12px',
  color: '#64748b',
  fontWeight: '500',
  letterSpacing: '0.5px',
}

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 40px 20px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 40px 16px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 40px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#f97316',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const codeSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '16px',
  textAlign: 'center' as const,
}

const code = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  margin: '0',
}

const footer = {
  margin: '40px 40px 0',
  padding: '20px 0',
  borderTop: '1px solid #e2e8f0',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}