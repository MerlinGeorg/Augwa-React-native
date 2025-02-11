import axios from 'axios';
import { API_BASEPATH_DEV, X_DOMAIN } from '@env';
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import React, { useState, useEffect, useContext } from 'react';


const Dashboard = () => {
    const {authToken} = useContext(AuthContext)
    const [scheduleData, setScheduleData] = useState(null)
    const [error, setError] = useState(null)

const fetchData = fetch(API_BASEPATH_DEV, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`, // Sending token in the request
    }
  })
  set

}

