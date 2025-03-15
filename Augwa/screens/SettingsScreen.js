import React, { useContext } from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet, Alert } from "react-native";
import { augwaBlue, dashboardArea } from "../assets/styles/color";
import { FontAwesome5 } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from "../src/context/AuthContext";
import axios from "axios";
import { API_BASEPATH_DEV } from '@env';
import ProfileScreen from "./ProfileScreen";

const SettingCard = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.sectionView}>
      <FontAwesome5 name={icon} size={20} style={styles.icon} />
      <Text style={styles.cardText}>{title}</Text>
    </View>
    <FontAwesome5 name="chevron-right" size={16} style={styles.arrowIcon} />
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }) => {
  const { setAuthToken, setUserName, domain } = useContext(AuthContext);

  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
      'Content-Type': 'application/json',
      'X-Domain': domain
    }
  });

  const handleLogout = async () => {
    console.log("Logged out")
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync('authToken');
            console.log("Retrieved Token: ", token);
            if (!token) {
              Alert.alert('Error', 'No authentication token found.');
              return;
            }

            // Use the axios instance without duplicating the base URL
            const response = await api.post("/Auth/Logout", {}, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Domain': domain
              },
            });

            console.log('Logout Response:', response.data);

            // Check response and clear data
            await SecureStore.deleteItemAsync('authToken');
            setAuthToken(null);
            setUserName(null);

            // Navigate to login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'login' }]
            });

          } catch (error) {
            console.error('Logout error:', error.response?.data || error.message || error);
            Alert.alert('Error', error.response?.data?.message || 'An error occurred during logout. Please try again.');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.viewStyle}>

      {/* -------Title of the page-----*/}
      <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
        <Text style={styles.Title}>Settings</Text>
      </View>

      {/* ----Dashboard area---- */}
      <View style={styles.dashboardAreaStyle}>
        <Text style={styles.sectionTitle}>Account Info</Text>

        {/* ----Settings List---- */}
        <SettingCard icon="user-circle" title="Profile" onPress={() => navigation.navigate(ProfileScreen)} />
        <SettingCard icon="bell" title="Notification Preferences" onPress={() => { }} />

        {/* ----Logout Button---- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    backgroundColor: augwaBlue,
  },
  dashboardAreaStyle: {
    marginTop: 20,
    height: '100%',
    backgroundColor: dashboardArea,
    borderRadius: 30,
  },
  Title: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    position: 'relative',
    top: 10
  },
  sectionTitle: {
    fontSize: 20,
    color: '#000',
    fontWeight: '500',
    marginLeft: 10,
    marginTop: 10
  },
  sectionView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    fontSize: 16
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#fff",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    borderRadius: 5,
    padding: 10,
  },
  arrowIcon: {
    fontSize: 20,
    marginLeft: 10,
    color: "#666",
  },
  icon: {
    marginRight: 10,
    color: "#444",
  },
  cardText: {
    fontSize: 16,
    color: "#000",
  },
  logoutButton: {
    position: 'absolute',
    bottom: 100,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: augwaBlue,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  }
})

export default SettingsScreen;