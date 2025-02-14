import axios from "axios";
import { API_BASEPATH_DEV, X_DOMAIN } from "@env";
import base64 from 'base-64';

const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
        "Content-Type": "application/json",
        "X-Domain": X_DOMAIN,
    },
});

const decodeJWT = (token) => {
    try {
        const [header, payload, signature] = token.split('.');
        const decodedPayload = base64.decode(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error('Failed decode:', error);
        return null;
    }
};

export const getBooking = async (authToken) => {
    if (!authToken) {
        return {
            success: false,
            error: { message: "Authentication token not provided", code: "NO_AUTH" },
        };
    }

    try {
        // Get staffId from token
        const payload = decodeJWT(authToken);
        const staffId = payload?.StaffId;

        if (!staffId) {
            throw new Error("Staff ID not found in token");
        }

        console.log("Fetching Bookings for staff ID:", staffId);

        const response = await api.get('/Booking', {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Filter bookings for the logged-in staff
        const staffBookings = response.data.results.filter((booking) => 
            booking.staff?.some((staffEntry) =>
                staffEntry?.staff?.id === staffId
            )
        );

        console.log("Staff bookings filtered:", staffBookings.length);
        return {
            success: true,
            data: staffBookings
        };

    } catch (error) {
        console.error("Error fetching bookings:", error);
        
        if (error.response) {
            const { status, data } = error.response;
            return {
                success: false,
                error: {
                    message: data.message || "Error fetching bookings",
                    code: status === 400 ? "BAD_REQUEST" :
                          status === 401 ? "UNAUTHORIZED" : "API_ERROR",
                },
            };
        }

        return {
            success: false,
            error: {
                message: "Network error or server unreachable",
                code: "NETWORK_ERROR",
            },
        };
    }
};