import { env } from '@/lib/env';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string }>;
}

function createConsoleEmail(): EmailAdapter {
  return {
    async send(message) {
      console.log('═══ EMAIL (console mode) ═══');
      console.log(`To:      ${message.to}`);
      console.log(`From:    ${message.from || env.SENDGRID_FROM_EMAIL}`);
      console.log(`Subject: ${message.subject}`);
      console.log(`Body:    ${message.html.substring(0, 200)}...`);
      console.log('═══════════════════════════');
      return { success: true, messageId: `console-${Date.now()}` };
    },
  };
}

function createSendGridEmail(): EmailAdapter {
  return {
    async send(message) {
      if (!env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY required when EMAIL_MODE=sendgrid');
      }
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: message.to }] }],
          from: { email: message.from || env.SENDGRID_FROM_EMAIL },
          subject: message.subject,
          content: [{ type: 'text/html', value: message.html }],
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`SendGrid failed (${response.status}): ${body}`);
      }
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
      };
    },
  };
}

export function getEmail(): EmailAdapter {
  switch (env.EMAIL_MODE) {
    case 'sendgrid':
      return createSendGridEmail();
    case 'console':
    default:
      return createConsoleEmail();
  }
}
