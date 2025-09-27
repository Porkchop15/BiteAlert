const cron = require('node-cron');
const axios = require('axios');
const CronExecution = require('../models/CronExecution');

class CronService {
  constructor() {
    this.isRunning = false;
  }

  // Check if we missed today's 8 AM execution and run it if needed
  async checkForMissedExecution() {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // If it's after 8 AM today, check if we missed the execution
      if (currentHour > 8 || (currentHour === 8 && currentMinute > 0)) {
        console.log('🕐 Checking for missed 8 AM execution...');
        
        // Check if we already ran today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const existingExecution = await CronExecution.findOne({
          jobName: 'treatment_reminders',
          executionDate: { $gte: today }
        });
        
        if (!existingExecution) {
          console.log('🕐 No execution found for today - running missed 8 AM treatment reminders...');
          await this.sendTreatmentReminders();
        } else {
          console.log('✅ Treatment reminders already executed today');
        }
      }
    } catch (error) {
      console.error('Error checking for missed execution:', error);
    }
  }

  // Start the cron job service
  start() {
    if (this.isRunning) {
      console.log('⚠️ Cron service is already running');
      return;
    }

    console.log('=== STARTING CRON SERVICE ===');
    
    // Check if we missed today's 8 AM execution
    this.checkForMissedExecution();
    
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
    let executionRecord = null;
    
    try {
      console.log('=== SENDING TREATMENT REMINDERS ===');
      
      // Record the execution start
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      console.log('📝 Creating CronExecution record...');
      console.log('CronExecution model:', typeof CronExecution);
      console.log('Today date:', today);
      
      executionRecord = new CronExecution({
        jobName: 'treatment_reminders',
        executionDate: today,
        status: 'running',
        executedAt: new Date()
      });
      
      console.log('📝 Saving cron execution record:', executionRecord.toObject());
      const savedRecord = await executionRecord.save();
      console.log('✅ Cron execution record saved with ID:', savedRecord._id);
      console.log('✅ Saved record:', savedRecord.toObject());
      
      // Import the notification function directly instead of making HTTP request
      const { sendTreatmentReminders } = require('../routes/notifications');
      
      // Call the function directly
      const result = await sendTreatmentReminders();
      
      console.log('✅ Treatment reminders sent successfully');
      console.log('Result:', result);
      
      // Update execution record with success
      if (executionRecord) {
        console.log('📝 Updating cron execution record with success status');
        await CronExecution.findByIdAndUpdate(executionRecord._id, {
          status: 'success',
          results: {
            totalTreatments: result.totalTreatments || 0,
            notificationsSent: result.notificationsSent || 0,
            errors: []
          }
        });
        console.log('✅ Cron execution record updated with success status');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error sending treatment reminders:', error.message);
      
      // Update execution record with failure
      if (executionRecord) {
        console.log('📝 Updating cron execution record with failure status');
        await CronExecution.findByIdAndUpdate(executionRecord._id, {
          status: 'failed',
          errorMessage: error.message,
          results: {
            totalTreatments: 0,
            notificationsSent: 0,
            errors: [error.message]
          }
        });
        console.log('✅ Cron execution record updated with failure status');
      }
      
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

