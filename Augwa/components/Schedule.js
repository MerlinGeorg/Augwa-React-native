import axios from "axios";
import { API_BASEPATH_DEV } from "@env";
import { API_BASEPATH_DEV } from "@env";
import base64 from 'base-64';

const { domain } = useContext(AuthContext);
const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
        "Content-Type": "application/json",
        "X-Domain": domain,
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

export const getBooking = async (authToken, domain) => {
    if (!authToken) {
        return {
            success: false,
            error: { message: "Authentication token not provided", code: "NO_AUTH" },
        };
    }

    const api = axios.create({
        baseURL: API_BASEPATH_DEV,
        headers: {
            "Content-Type": "application/json",
            "X-Domain": domain,
        },
    });

    try {
        // Get staffId from token
        const payload = decodeJWT(authToken);
        const staffId = payload?.StaffId;

        if (!staffId) {
            throw new Error("Staff ID not found in token");
        }

        console.log("Fetching Bookings for staff ID:", staffId);

        let allBookings = [];
        let page = 1;
        let totalPages = 1;
        const pageSize = 10;

        do {
            const response = await api.get(`/Booking`, {
                params: {
                    StaffId: staffId,
                    Page: page,
                    PageSize: pageSize,
                },
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const { results, pageCount } = response.data;
            console.log(`Fetched Page ${page}: ${results.length} records`);

            if (results.length > 0) {
                allBookings = [...allBookings, ...results];
            }

            totalPages = pageCount;
            page++; // continue to next page
        } while (page <= totalPages); // end the while until fetch all pages


        return {
            success: true,
            data: allBookings
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