import axios from 'axios';
import { API_BASEPATH_DEV, X_DOMAIN } from '@env';
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import React, { useState, useEffect, useContext } from 'react';


const Dashboard = () => {
    const { authToken } = useContext(AuthContext)
    const [scheduleData, setScheduleData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (authToken) {
            fetchData()
        }
    }, [authToken])

    const fetchJoblist = async () => {
        
        try {
          if (!authToken) {
            throw new Error("No authentication token available");
          }
    
          console.log('Making request to:', `${API_BASEPATH_DEV}/Booking`);
          console.log('Headers:', {
            'Authorization': `Bearer ${authToken.substring(0, 10)}...` // Log first 10 chars only
          });
    
          let allResults = []
          let page = 1
          let hasMoreData = true
          while (hasMoreData) {
            const response = await api.get(`/Booking?page=${page}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            if (response.data.results.length > 0){
          
              allResults = [...allResults, ...response.data.results]
              page++
            } else {
              hasMoreData = false
            }
          }
          console.log(`All result: ${allResults}`)
          setScheduleData(allResults)
        } catch (error) {
          if (error.response) {
            // Server responded with error
            console.error('Error Response Data:', error.response.data);
            console.error('Error Response Status:', error.response.status);
            console.error('Error Response Headers:', error.response.headers);
            setError(`Server Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
          } else if (error.request) {
            // Request made but no response
            console.error('Error Request:', error.request);
            setError('No response received from server');
          } else {
            // Error setting up request
            console.error('Error Message:', error.message);
            setError(`Error: ${error.message}`);
          }
        }
      };
}




