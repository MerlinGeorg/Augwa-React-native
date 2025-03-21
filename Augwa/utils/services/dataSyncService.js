import axios from 'axios';
import { OfflineStorage } from "./offlineStorageService";
import { API_BASEPATH_DEV } from "@env";

export const SyncService = {
  // Initialize API client
  createApiClient: (authToken, domain) => {
    return axios.create({
      baseURL: API_BASEPATH_DEV,
      headers: {
        "Content-Type": "application/json",
        "X-Domain": domain,
        "Authorization": `Bearer ${authToken}`
      },
    });
  },

  // Sync schedules with server
  syncSchedules: async (authToken, domain, user) => {
    const api = SyncService.createApiClient(authToken, domain);
    
    try {
      // Get bookings from API
      const response = await api.get('/Booking');
      if (response.status === 200) {
      //  console.log('booking API Response:', response.data); // Add this line

        const assignedBookings = response.data.results.filter(booking => booking.assignedTo === user);
        
        // Save to offline storage
        await OfflineStorage.saveSchedules(assignedBookings);
        
        return {
          success: true,
          data: assignedBookings
        };
      }
      return { success: false, error: 'Failed to fetch bookings' };
    } catch (error) {
      console.error('Error syncing schedules:', error);
      return { success: false, error: error.message };
    }
  },

  // Sync specific job details with server
  syncJobDetails: async (authToken, domain, jobId) => {
    const api = SyncService.createApiClient(authToken, domain);
    
    try {
      const response = await api.get(`/Booking/${jobId}`);
      if (response.status === 200) {
        // Save to offline storage
        await OfflineStorage.saveJobDetails(jobId, response.data);
        
        return {
          success: true,
          data: response.data
        };
      }
      return { success: false, error: 'Failed to fetch job details' };
    } catch (error) {
      console.error('Error syncing job details:', error);
      return { success: false, error: error.message };
    }
  },

  // Process pending actions when back online
  processPendingActions: async (authToken, domain) => {
    const api = SyncService.createApiClient(authToken, domain);
    const pendingActions = await OfflineStorage.getPendingActions();
    
    if (pendingActions.length === 0) {
      return { success: true, message: 'No pending actions' };
    }
    
    const results = [];
    let hasErrors = false;
    
    for (const action of pendingActions) {
      try {
        let response;
        
        // Process different types of actions
        switch (action.type) {
          case 'start_job':
            response = await api.post(`/Booking/${action.jobId}/Start`, {});
            break;
          case 'complete_job':
            response = await api.post(`/Booking/${action.jobId}/Complete`, {});
            break;
          case 'cancel_job':
            response = await api.post(`/Booking/${action.jobId}/Stop`, {});
            break;
          case 'add_note':
            response = await api.post(`/Booking/${action.jobId}/Notes`, action.payload);
            break;
          case 'travel_start':
            response = await api.post(`/TimeTracking`, action.payload);
            break;
          default:
            throw new Error(`Unknown action type: ${action.type}`);
        }
        
        if (response.status === 200 || response.status === 204) {
          results.push({ action, success: true });
        } else {
          hasErrors = true;
          results.push({ action, success: false, error: 'Server returned an error' });
        }
      } catch (error) {
        hasErrors = true;
        results.push({ action, success: false, error: error.message });
      }
    }
    
    // Only clear if all actions were successful
    if (!hasErrors) {
      await OfflineStorage.clearPendingActions();
    } else {
      // Filter out successful actions and save the rest
      const failedActions = results
        .filter(result => !result.success)
        .map(result => result.action);
      
      await AsyncStorage.setItem(
        StorageKeys.PENDING_ACTIONS, 
        JSON.stringify(failedActions)
      );
    }
    
    return { success: !hasErrors, results };
  }
};