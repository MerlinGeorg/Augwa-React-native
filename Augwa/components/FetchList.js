import axios from 'axios';
import { API_BASEPATH_DEV, X_DOMAIN } from '@env';
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import React, { useState} from 'react';


export const fetchJoblist = async (token, setScheduleData, setError) => {
  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
      'Content-Type': 'application/json',
      'X-Domain': X_DOMAIN  // Ensure this header is correct
    }
  });
  try {
    if (!token) throw new Error("No authentication token available");
    let allResults = [];
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      const response = await api.get(`/Booking?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.data.results.length > 0) {
        allResults = [...allResults, ...response.data.results];
        page++;
      } else {
        hasMoreData = false;
      }
    }
    setScheduleData(allResults);
  } catch (error) {
    setError(error.message);
  }
}