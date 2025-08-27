import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  app_base_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
  first_name?: string
}

export const PasswordResetEmail = ({
  token_hash,
  app_base_url,
  email_action_type,
  redirect_to,
  user_email,
  first_name,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Your Password</Heading>
        <Text style={text}>
          Hi {first_name ? first_name : 'there'},
        </Text>
        <Text style={text}>
          We received a request to reset your password for your Tech With Ayushi Aggarwal account.
        </Text>
        <Text style={text}>Click the button below to set up a new password:</Text>
        <Section style={buttonContainer}>
          <Button
            href={`${app_base_url}/auth/verify?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`}
            style={button}
          >
            Reset Password
          </Button>
        </Section>
        <Text style={text}>Or, copy and paste this link into your browser:</Text>
        <Link
          href={`${app_base_url}/auth/verify?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`}
          style={link}
        >
          {`${app_base_url}/auth/verify?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`}
        </Link>
        <Text style={disclaimer}>
          If you didn't request this, you can safely ignore this email, your account will remain secure.
        </Text>
        <Text style={disclaimer}>For your security, this link will expire in 1 hour.</Text>
        <Text style={footer}>
          Thanks,<br />
          Ayushi Aggarwal &amp; Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '8px',
  margin: '40px auto',
  padding: '40px',
  width: '600px',
  maxWidth: '100%',
}

const h1 = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const text = {
  color: '#555555',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  minWidth: '200px',
}

const link = {
  color: '#007ee6',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const disclaimer = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '20px 0 0',
}

const footer = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  paddingTop: '20px',
  borderTop: '1px solid #eee',
}