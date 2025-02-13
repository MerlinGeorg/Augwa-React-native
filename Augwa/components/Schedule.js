import axios from "axios";
import { API_BASEPATH_DEV,X_DOMAIN } from '@env';

const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
        'Content-Type': 'application/json',
        'X_domain': X_DOMAIN
    }
});

export const getBooking = async () => {
    try {
        console.log("Fetching Bookings...");
        const response = await api.get('/Booking');
        console.log("Booking fetched");
        console.log("Response Status: ", response.status);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error("Error fetching", error);
        if (error.response) {
            const { status, data } = error.response;
            switch(status) {
                case 400:
                    return {
                        success: false,
                        error: {
                            message: data.message|| 'Bad Request',
                            code: 'BAD_REQUEST'
                        }
                    };
                case 401: 
                    return {
                        success: false,
                        error: {
                            message: data.message|| 'Unauthorized',
                            code: 'UNAUTHORIZED'
                        }
                }
                default:
                        return {
                            success: false,
                            error: { message: data.message || 'Error fetching bookings', code: 'API_ERROR' }
                        };
            }
        }
    }
}
