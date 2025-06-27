// Email service for Keepr notifications
import { generateRecipientInstructions } from './encryption';

export interface EmailConfig {
  serviceUrl: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface KeepNotificationData {
  keepTitle: string;
  keepDescription?: string;
  unlockTime: string;
  creatorAddress: string;
  recipientAddress: string;
  recipientEmail: string;
  fallbackAddress?: string;
  fallbackEmail?: string;
  appUrl?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email service using a simple HTTP API (could be SendGrid, Mailgun, etc.)
class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Generate email template for keep availability notification
  private generateKeepAvailableEmail(data: KeepNotificationData): EmailTemplate {
    const unlockDate = new Date(data.unlockTime).toLocaleDateString();
    const appUrl = data.appUrl || 'https://keepr.app';
    
    const subject = `Your Keep "${data.keepTitle}" is now available`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keep Available - Keepr</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Keepr</h1>
            <p>Your Keep is now available</p>
        </div>
        <div class="content">
            <h2>Hello!</h2>
            <p>You have been designated as a recipient for a Keep titled <strong>"${data.keepTitle}"</strong> that is now available for access.</p>
            
            ${data.keepDescription ? `<p><strong>Description:</strong> ${data.keepDescription}</p>` : ''}
            
            <p><strong>Unlock Date:</strong> ${unlockDate}</p>
            <p><strong>Creator:</strong> ${data.creatorAddress.slice(0, 6)}...${data.creatorAddress.slice(-4)}</p>
            
            <div class="warning">
                <strong>⚠️ Important Security Note:</strong><br>
                Only you can decrypt this content using your wallet (${data.recipientAddress.slice(0, 6)}...${data.recipientAddress.slice(-4)}). 
                The content is end-to-end encrypted and stored securely on IPFS.
            </div>
            
            <h3>To access your Keep:</h3>
            <ol>
                <li>Visit <a href="${appUrl}">${appUrl}</a></li>
                <li>Connect your wallet (address: ${data.recipientAddress.slice(0, 6)}...${data.recipientAddress.slice(-4)})</li>
                <li>Navigate to your Dashboard</li>
                <li>Look for the Keep titled "${data.keepTitle}" in your available keeps</li>
                <li>Click on the Keep to view and decrypt the content</li>
            </ol>
            
            <a href="${appUrl}" class="button">Access Your Keep</a>
            
            <p>If you have any issues accessing your Keep, please contact the creator or reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from Keepr - Secure Digital Inheritance</p>
            <p>If you received this email in error, please ignore it.</p>
        </div>
    </div>
</body>
</html>`;

    const text = generateRecipientInstructions(
      data.recipientAddress,
      data.keepTitle,
      data.unlockTime,
      appUrl
    );

    return { subject, html, text };
  }

  // Generate email template for fallback recipient notification
  private generateFallbackNotificationEmail(data: KeepNotificationData): EmailTemplate {
    const unlockDate = new Date(data.unlockTime).toLocaleDateString();
    const appUrl = data.appUrl || 'https://keepr.app';
    
    const subject = `Fallback Recipient: Keep "${data.keepTitle}" is now available`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fallback Keep Available - Keepr</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Keepr</h1>
            <p>Fallback Keep Available</p>
        </div>
        <div class="content">
            <h2>Important Notice</h2>
            <p>You have been designated as a <strong>fallback recipient</strong> for a Keep titled <strong>"${data.keepTitle}"</strong> that is now available for access.</p>
            
            <div class="warning">
                <strong>🚨 Fallback Access Activated:</strong><br>
                The primary recipient has not claimed this Keep, so you now have access as the fallback recipient.
            </div>
            
            ${data.keepDescription ? `<p><strong>Description:</strong> ${data.keepDescription}</p>` : ''}
            
            <p><strong>Unlock Date:</strong> ${unlockDate}</p>
            <p><strong>Creator:</strong> ${data.creatorAddress.slice(0, 6)}...${data.creatorAddress.slice(-4)}</p>
            <p><strong>Primary Recipient:</strong> ${data.recipientAddress.slice(0, 6)}...${data.recipientAddress.slice(-4)}</p>
            
            <h3>To access your Keep:</h3>
            <ol>
                <li>Visit <a href="${appUrl}">${appUrl}</a></li>
                <li>Connect your wallet (address: ${data.fallbackAddress?.slice(0, 6)}...${data.fallbackAddress?.slice(-4)})</li>
                <li>Navigate to your Dashboard</li>
                <li>Look for the Keep titled "${data.keepTitle}" in your available keeps</li>
                <li>Click on the Keep to view and decrypt the content</li>
            </ol>
            
            <a href="${appUrl}" class="button">Access Your Keep</a>
            
            <p><strong>Note:</strong> As a fallback recipient, you have the same access rights as the primary recipient. Please handle this content responsibly.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from Keepr - Secure Digital Inheritance</p>
            <p>If you received this email in error, please ignore it.</p>
        </div>
    </div>
</body>
</html>`;

    const text = `Fallback Recipient Notification

You have been designated as a fallback recipient for a Keep titled "${data.keepTitle}" that is now available.

IMPORTANT: The primary recipient has not claimed this Keep, so you now have access as the fallback recipient.

Description: ${data.keepDescription || 'No description provided'}
Unlock Date: ${unlockDate}
Creator: ${data.creatorAddress}
Primary Recipient: ${data.recipientAddress}

To access your Keep:

1. Visit ${appUrl}
2. Connect your wallet (address: ${data.fallbackAddress})
3. Navigate to your Dashboard
4. Look for the Keep titled "${data.keepTitle}" in your available keeps
5. Click on the Keep to view and decrypt the content

Note: As a fallback recipient, you have the same access rights as the primary recipient. Please handle this content responsibly.

Best regards,
The Keepr Team`;

    return { subject, html, text };
  }

  // Send email using configured service
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const response = await fetch(this.config.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName,
          },
          to: [{ email: to }],
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send notification to primary recipient
  async notifyPrimaryRecipient(data: KeepNotificationData): Promise<boolean> {
    const template = this.generateKeepAvailableEmail(data);
    return this.sendEmail(data.recipientEmail, template);
  }

  // Send notification to fallback recipient
  async notifyFallbackRecipient(data: KeepNotificationData): Promise<boolean> {
    if (!data.fallbackEmail || !data.fallbackAddress) {
      console.warn('No fallback email or address provided');
      return false;
    }

    const template = this.generateFallbackNotificationEmail(data);
    return this.sendEmail(data.fallbackEmail, template);
  }

  // Send notifications to both recipients
  async sendKeepNotifications(data: KeepNotificationData): Promise<{
    primary: boolean;
    fallback: boolean;
  }> {
    const results = {
      primary: false,
      fallback: false,
    };

    // Send to primary recipient
    if (data.recipientEmail) {
      results.primary = await this.notifyPrimaryRecipient(data);
    }

    // Send to fallback recipient if available
    if (data.fallbackEmail && data.fallbackAddress) {
      results.fallback = await this.notifyFallbackRecipient(data);
    }

    return results;
  }
}

// Create and export email service instance
let emailService: EmailService | null = null;

export function initializeEmailService(config: EmailConfig): void {
  emailService = new EmailService(config);
}

export function getEmailService(): EmailService | null {
  return emailService;
}

// Utility function to check if email service is configured
export function isEmailServiceConfigured(): boolean {
  return emailService !== null;
}

// Utility function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to schedule notifications (for future implementation)
export async function scheduleKeepNotification(
  keepData: KeepNotificationData,
  unlockTime: Date
): Promise<void> {
  // This would integrate with a job scheduler like Bull, Agenda, or a cloud service
  // For now, we'll just log the scheduling
  console.log(`Scheduling notification for keep "${keepData.keepTitle}" at ${unlockTime.toISOString()}`);
  
  // In a real implementation, you would:
  // 1. Store the notification job in a database
  // 2. Use a job scheduler to trigger the notification at unlockTime
  // 3. Handle retries and failures
  // 4. Track notification delivery status
}

// Mock email service for development/testing
class MockEmailService extends EmailService {
  constructor() {
    super({
      serviceUrl: 'mock://email.service',
      apiKey: 'mock-key',
      fromEmail: 'noreply@keepr.app',
      fromName: 'Keepr',
    });
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    console.log('📧 MOCK EMAIL SENT:');
    console.log('To:', to);
    console.log('Subject:', template.subject);
    console.log('Text Content:', template.text);
    console.log('HTML Content:', template.html);
    console.log('---');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  }
}

// Initialize with mock service for development
if (import.meta.env.DEV) {
  emailService = new MockEmailService();
  console.log('📧 Mock email service initialized for development');
} 