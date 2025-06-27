// Notification service for Keepr
import { getEmailService, KeepNotificationData } from './email';
import { downloadFromIPFS, listFiles } from './wallet';

export interface KeepNotificationJob {
  id: string;
  keepTitle: string;
  unlockTime: string;
  recipientAddress: string;
  recipientEmail: string;
  fallbackAddress?: string;
  fallbackEmail?: string;
  creatorAddress: string;
  ipfsHash: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
}

// In-memory storage for notification jobs (in production, use a database)
const notificationJobs: Map<string, KeepNotificationJob> = new Map();

// Check for keeps that have become available and send notifications
export async function checkAndSendNotifications(): Promise<{
  checked: number;
  sent: number;
  failed: number;
}> {
  const results = {
    checked: 0,
    sent: 0,
    failed: 0,
  };

  try {
    console.log('Checking for keeps that need notifications...');
    
    // Get all keeps from IPFS
    const allFiles = await listFiles();
    const now = new Date();
    
    for (const file of allFiles) {
      const metadata = file.metadata?.keyvalues || {};
      const unlockTime = new Date(metadata.unlockTime);
      
      // Check if keep is now available
      if (unlockTime <= now) {
        results.checked++;
        
        const jobId = `${file.ipfs_pin_hash}-${metadata.recipient}`;
        
        // Skip if we've already sent a notification for this keep/recipient
        if (notificationJobs.has(jobId)) {
          continue;
        }
        
        // Create notification job
        const job: KeepNotificationJob = {
          id: jobId,
          keepTitle: metadata.title || 'Untitled Keep',
          unlockTime: metadata.unlockTime,
          recipientAddress: metadata.recipient,
          recipientEmail: metadata.recipientEmail,
          fallbackAddress: metadata.fallback,
          fallbackEmail: metadata.fallbackEmail,
          creatorAddress: metadata.creator,
          ipfsHash: file.ipfs_pin_hash,
          status: 'pending',
          createdAt: new Date(),
        };
        
        // Send notification
        const success = await sendKeepNotification(job);
        
        if (success) {
          job.status = 'sent';
          job.sentAt = new Date();
          results.sent++;
        } else {
          job.status = 'failed';
          results.failed++;
        }
        
        notificationJobs.set(jobId, job);
      }
    }
    
    console.log(`Notification check complete: ${results.checked} checked, ${results.sent} sent, ${results.failed} failed`);
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
  
  return results;
}

// Send notification for a specific keep
async function sendKeepNotification(job: KeepNotificationJob): Promise<boolean> {
  try {
    const emailService = getEmailService();
    if (!emailService) {
      console.warn('Email service not configured');
      return false;
    }
    
    // Get keep data from IPFS
    const keepData = await downloadFromIPFS(job.ipfsHash);
    
    const notificationData: KeepNotificationData = {
      keepTitle: job.keepTitle,
      keepDescription: keepData.meta?.description,
      unlockTime: job.unlockTime,
      creatorAddress: job.creatorAddress,
      recipientAddress: job.recipientAddress,
      recipientEmail: job.recipientEmail,
      fallbackAddress: job.fallbackAddress,
      fallbackEmail: job.fallbackEmail,
      appUrl: window.location.origin,
    };
    
    // Send notifications
    const results = await emailService.sendKeepNotifications(notificationData);
    
    return results.primary || results.fallback;
  } catch (error) {
    console.error('Failed to send keep notification:', error);
    return false;
  }
}

// Get all notification jobs
export function getNotificationJobs(): KeepNotificationJob[] {
  return Array.from(notificationJobs.values());
}

// Get notification job by ID
export function getNotificationJob(id: string): KeepNotificationJob | undefined {
  return notificationJobs.get(id);
}

// Clear old notification jobs (older than 30 days)
export function cleanupOldNotifications(): void {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  for (const [id, job] of notificationJobs.entries()) {
    if (job.createdAt < thirtyDaysAgo) {
      notificationJobs.delete(id);
    }
  }
}

// Manual notification trigger (for testing)
export async function triggerNotificationForKeep(ipfsHash: string): Promise<boolean> {
  try {
    const allFiles = await listFiles();
    const file = allFiles.find(f => f.ipfs_pin_hash === ipfsHash);
    
    if (!file) {
      console.error('Keep not found:', ipfsHash);
      return false;
    }
    
    const metadata = file.metadata?.keyvalues || {};
    const jobId = `${ipfsHash}-${metadata.recipient}`;
    
    const job: KeepNotificationJob = {
      id: jobId,
      keepTitle: metadata.title || 'Untitled Keep',
      unlockTime: metadata.unlockTime,
      recipientAddress: metadata.recipient,
      recipientEmail: metadata.recipientEmail,
      fallbackAddress: metadata.fallback,
      fallbackEmail: metadata.fallbackEmail,
      creatorAddress: metadata.creator,
      ipfsHash: ipfsHash,
      status: 'pending',
      createdAt: new Date(),
    };
    
    const success = await sendKeepNotification(job);
    
    if (success) {
      job.status = 'sent';
      job.sentAt = new Date();
    } else {
      job.status = 'failed';
    }
    
    notificationJobs.set(jobId, job);
    return success;
  } catch (error) {
    console.error('Failed to trigger notification:', error);
    return false;
  }
}

// Initialize notification system
export function initializeNotificationSystem(): void {
  // Set up periodic checks (every 5 minutes)
  setInterval(checkAndSendNotifications, 5 * 60 * 1000);
  
  // Clean up old notifications daily
  setInterval(cleanupOldNotifications, 24 * 60 * 60 * 1000);
  
  console.log('Notification system initialized');
} 