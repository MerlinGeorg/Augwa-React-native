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
            const response = await axios.get(`{API_BASEPATH_DEV}/Booking`, {
                headers: {
                    'Authorization':`Bearer ${authToken}`,
                }
            })
            setScheduleData(response.data)
        }catch(error){
            setError('Error fetching schedule data')
            console.error(err)
        }
    }
}




