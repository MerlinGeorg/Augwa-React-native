import axios from 'axios';
import { API_BASEPATH_DEV } from '@env';

export const fetchJoblist = async (token, domain, setScheduleData, setError) => {
  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
      'Content-Type': 'application/json',
      'X-Domain': domain
    }
  });

  try {
    if (!token) throw new Error("No authentication token available");
    
    let allResults = [];
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      const response = await api.get(`/Booking`, {
        params: { page },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Assuming your API returns a specific structure
      const pageResults = response.data.results || response.data;
      
      if (pageResults.length > 0) {
        allResults = [...allResults, ...pageResults];
        page++;
      } else {
        hasMoreData = false;
      }
    }

    // Add additional filtering or sorting if needed
    const processedResults = allResults.sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );

    // Use a callback to ensure state update
    setScheduleData(prevData => {
      // Compare new data with previous to avoid unnecessary re-renders
      const isDataChanged = JSON.stringify(prevData) !== JSON.stringify(processedResults);
      return isDataChanged ? processedResults : prevData;
    });

    return processedResults; // Optional: return for further processing
  } catch (error) {
    console.error('Fetch Job List Error:', error);
    setError(error.message || 'Failed to fetch job list');
    return []; // Return empty array to prevent undefined errors
  }
};