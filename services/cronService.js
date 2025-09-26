const cron = require('node-cron');
const axios = require('axios');

class CronService {
  constructor() {
    this.isRunning = false;
  }

  // Start the cron job service
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cron service is already running');
      return;
    }

    console.log('=== STARTING CRON SERVICE ===');
    
    // Schedule treatment reminders to run daily at 8:00 AM
    const treatmentReminderJob = cron.schedule('0 8 * * *', async () => {
      console.log('🕐 Running daily treatment reminder job...');
      await this.sendTreatmentReminders();
    }, {
      scheduled: true,
      timezone: "Asia/Manila" // Philippines timezone
    });

    // Schedule a test job to run every minute (for testing)
    const testJob = cron.schedule('* * * * *', async () => {
      console.log('🕐 Test job running...');
      // Uncomment the line below to test treatment reminders
      // await this.sendTreatmentReminders();
    }, {
      scheduled: false, // Set to true to enable test job
      timezone: "Asia/Manila"
    });

    this.isRunning = true;
    console.log('✅ Cron service started successfully');
    console.log('📅 Treatment reminders scheduled for 8:00 AM daily (Asia/Manila)');
  }

  // Stop the cron service
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Cron service is not running');
      return;
    }

    cron.destroy();
    this.isRunning = false;
    console.log('✅ Cron service stopped');
  }

  // Send treatment reminders
  async sendTreatmentReminders() {
    try {
      console.log('=== SENDING TREATMENT REMINDERS ===');
      
      // Import the notification function directly instead of making HTTP request
      const { sendTreatmentReminders } = require('../routes/notifications');
      
      // Call the function directly
      const result = await sendTreatmentReminders();
      
      console.log('✅ Treatment reminders sent successfully');
      console.log('Result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error sending treatment reminders:', error.message);
      throw error;
    }
  }

  // Manual trigger for testing
  async triggerTreatmentReminders() {
    console.log('=== MANUAL TRIGGER: TREATMENT REMINDERS ===');
    try {
      const result = await this.sendTreatmentReminders();
      console.log('✅ Manual trigger completed successfully');
      return result;
    } catch (error) {
      console.error('❌ Manual trigger failed:', error.message);
      throw error;
    }
  }

  // Get cron service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      timezone: 'Asia/Manila',
      scheduledJobs: [
        {
          name: 'Treatment Reminders',
          schedule: '0 8 * * *',
          description: 'Daily at 8:00 AM',
          timezone: 'Asia/Manila'
        }
      ]
    };
  }
}

// Create singleton instance
const cronService = new CronService();

module.exports = cronService;

