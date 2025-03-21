import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  SCHEDULES: 'app_schedules',
  JOB_DETAILS: 'app_job_details_',
  LAST_SYNC: 'app_last_sync',
  PENDING_ACTIONS: 'app_pending_actions'
};

export const OfflineStorage = {
  // Save schedules to local storage
  saveSchedules: async (schedules) => {
    try {
      await AsyncStorage.setItem(StorageKeys.SCHEDULES, JSON.stringify(schedules));
      await AsyncStorage.setItem(StorageKeys.LAST_SYNC, new Date().toISOString());
      console.log("Schedules saved successfully:", schedules.length);
      return true;
    } catch (error) {
      console.error('Error saving schedules:', error);
      return false;
    }
  },

  // Get cached schedules
  getSchedules: async () => {
    try {
      const data = await AsyncStorage.getItem(StorageKeys.SCHEDULES);
      const parsedData = data ? JSON.parse(data) : [];  // Parse or default to []
      console.log("Retrieved schedules from AsyncStorage:", parsedData.length);
      return parsedData;
    } catch (error) {
      console.error('Error retrieving schedules:', error);
      return [];
    }
  },

  // Save job details to local storage
  saveJobDetails: async (jobId, jobDetails) => {
    try {
      await AsyncStorage.setItem(`${StorageKeys.JOB_DETAILS}${jobId}`, JSON.stringify(jobDetails));
      return true;
    } catch (error) {
      console.error('Error saving job details:', error);
      return false;
    }
  },

  // Get cached job details
  getJobDetails: async (jobId) => {
    try {
      const data = await AsyncStorage.getItem(`${StorageKeys.JOB_DETAILS}${jobId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving job details:', error);
      return null;
    }
  },

  // Save pending actions for later sync
  savePendingAction: async (action) => {
    try {
      const pendingActions = await OfflineStorage.getPendingActions();
      pendingActions.push({
        ...action,
        timestamp: new Date().toISOString()
      });
      await AsyncStorage.setItem(StorageKeys.PENDING_ACTIONS, JSON.stringify(pendingActions));
      return true;
    } catch (error) {
      console.error('Error saving pending action:', error);
      return false;
    }
  },

  // Get all pending actions
  getPendingActions: async () => {
    try {
      const data = await AsyncStorage.getItem(StorageKeys.PENDING_ACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving pending actions:', error);
      return [];
    }
  },

  // Clear pending actions after successful sync
  clearPendingActions: async () => {
    try {
      await AsyncStorage.setItem(StorageKeys.PENDING_ACTIONS, JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Error clearing pending actions:', error);
      return false;
    }
  },

  // Get last sync timestamp
  getLastSyncTime: async () => {
    try {
      return await AsyncStorage.getItem(StorageKeys.LAST_SYNC);
    } catch (error) {
      console.error('Error retrieving last sync time:', error);
      return null;
    }
  }
};