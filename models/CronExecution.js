const mongoose = require('mongoose');

const cronExecutionSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
    index: true
  },
  executionDate: {
    type: Date,
    required: true,
    index: true
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'running'],
    default: 'running'
  },
  results: {
    totalTreatments: Number,
    notificationsSent: Number,
    errors: [String]
  },
  errorMessage: String
}, {
  timestamps: true,
  collection: 'cron_executions'
});

// Index for efficient queries
cronExecutionSchema.index({ jobName: 1, executionDate: 1 });

const CronExecution = mongoose.model('CronExecution', cronExecutionSchema);

module.exports = CronExecution;
