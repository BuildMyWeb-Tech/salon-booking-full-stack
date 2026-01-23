// utils/appointmentCron.js
import cron from 'node-cron';
import appointmentModel from '../models/appointmentModel.js';

/**
 * Automatically mark appointments as completed when their time has passed
 * Runs every 15 minutes
 */
export const startAppointmentCompletionCron = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('Running appointment completion check...');
      
      const now = new Date();
      
      // Find all appointments that:
      // 1. Are not cancelled
      // 2. Are not completed
      // 3. Have a slotDateTime in the past (with 30 min buffer for service duration)
      const thirtyMinutesAgo = new Date(now.getTime() - (30 * 60 * 1000));
      
      const result = await appointmentModel.updateMany(
        {
          cancelled: false,
          isCompleted: false,
          slotDateTime: { $lt: thirtyMinutesAgo }
        },
        {
          $set: { isCompleted: true }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Marked ${result.modifiedCount} appointments as completed`);
      }
      
    } catch (error) {
      console.error('Error in appointment completion cron:', error);
    }
  });
  
  console.log('✅ Appointment completion cron job started (runs every 15 minutes)');
};

/**
 * Manual function to check and complete past appointments
 * Can be called on server startup
 */
export const completePastAppointments = async () => {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - (30 * 60 * 1000));
    
    const result = await appointmentModel.updateMany(
      {
        cancelled: false,
        isCompleted: false,
        slotDateTime: { $lt: thirtyMinutesAgo }
      },
      {
        $set: { isCompleted: true }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Completed ${result.modifiedCount} past appointments on startup`);
    }
    
    return result.modifiedCount;
  } catch (error) {
    console.error('Error completing past appointments:', error);
    return 0;
  }
};