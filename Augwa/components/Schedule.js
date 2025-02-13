import axios from "axios";
import { API_BASEPATH_DEV, X_DOMAIN } from "@env";

const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
        "Content-Type": "application/json",
        "X-Domain": X_DOMAIN, // Ensure this matches API expectations
    },
});

// Fetch bookings assigned to the logged-in user
export const getBooking = async (authToken) => {
    if (!authToken) {
        return {
            success: false,
            error: { message: "Authentication token not provided", code: "NO_AUTH" },
        };
    }

    try {
        console.log("Fetching Bookings...");

        const response = await api.get("/Booking", {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        console.log("Assigned Bookings fetched", response.status);
        return {
            success: true,
            data: response.data,
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
        } else {
            return {
                success: false,
                error: {
                    message: "Network error or server unreachable",
                    code: "NETWORK_ERROR",
                },
            };
        }
    }
};
