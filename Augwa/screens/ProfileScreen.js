import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { augwaBlue, dashboardArea } from "../assets/styles/color";
import { AuthContext } from "../src/context/AuthContext";
import axios from "axios";
import { API_BASEPATH_DEV } from "@env";
import base64 from 'base-64';

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

export const getStaff = async (authToken, domain) => {
    if (!authToken) {
        return {
            success: false,
            error: { message: "Authentication token not provided", code: "NO_AUTH" },
        };
    }

    const api = axios.create({
        baseURL: API_BASEPATH_DEV,
        headers: {
            "X-Domain": domain,
        },
    });

    try {
      
        const payload = decodeJWT(authToken);
        const staffId = payload?.StaffId;

        if (!staffId) {
            throw new Error("Staff ID not found in token");
        }

        console.log("Fetching Profile for staff ID:", staffId);

            const response = await api.get(`/Staff/${staffId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        return {
            success: true,
            data: response.data
        };

    } catch (error) {
        console.error("Error fetching profile:", error);
        
        if (error.response) {
            const { status, data } = error.response;
            return {
                success: false,
                error: {
                    message: data.message || "Error fetching profile",
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

const ProfileScreen = () => {
    const { authToken, domain } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const response = await getStaff(authToken, domain);

            if (response.success) {
                setUserData(response.data);
            } else {
                setError(response.error.message);
            }
            setLoading(false);
        };

        fetchUserProfile();
    }, [authToken, domain]);

    return (
        <SafeAreaView style={styles.viewStyle}>
            <View style={styles.dashboardAreaStyle}>
                <View style={styles.iconStyle}>
                    <FontAwesome name="user-circle" style={styles.Icon} />
                </View>
                <View >
                    <Text style = {styles.displayText}>{userData?.displayName || "N/A"}</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <View>
                        <View style={styles.textBox}>
                            <Text style={styles.profText}>firstname:</Text>
                            <Text style={styles.text}>{userData?.firstName || "N/A"}</Text>
                        </View>
                        
                        <View style={styles.textBox}>
                            <Text style={styles.profText}>lastname:</Text>
                            <Text style={styles.text}>{userData?.lastName || "N/A"}</Text>
                        </View>
                        
                        <View style={styles.textBox}>
                            <Text style={styles.profText}>Email:</Text>
                            <Text style={styles.text}>{userData?.emailAddress || "N/A"}</Text>
                        </View>
                        
                        <View style={styles.textBox}>
                            <Text style={styles.profText}>Phone Number:</Text>
                            <Text style={styles.text}>{userData?.phoneNumber || "N/A"}</Text>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    viewStyle: {
        flex: 1,
        backgroundColor: augwaBlue,
    },
    dashboardAreaStyle: {
        height: "110%",
        backgroundColor: dashboardArea,
        borderRadius: 30,
        padding: 20,
    },
    iconStyle: {
        alignSelf: "center",
    },
    Icon: {
        fontSize: 70,
        marginBottom: 20,
        alignSelf: "center",
    },
    displayText: {
        fontSize: 20,
        alignSelf: 'center',
        fontWeight: 'bold',
        marginBottom: 10
    },
    textBox: {
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 10,
        backgroundColor: "#fff",
        flexDirection: 'column'
    },
    profText: {
        color: "#999",
        fontSize: 12
    },
    text: {
        fontSize: 16,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
});

export default ProfileScreen;