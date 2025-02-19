import React, { useState, useContext } from "react";
import { TouchableOpacity, Text, View, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { augwaBlue, dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';
import axios from "axios";
import { API_BASEPATH_DEV, X_DOMAIN } from "@env";

const ScheduleDetailScreen = ({ route }) => {
  const { authToken, user } = useContext(AuthContext);
  const { job: initialJob } = route.params;
  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(false);
  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
      "Content-Type": "application/json",
      "X-Domain": X_DOMAIN,
    },
  });

  const fetchUpdatedJob = async () => {
    try {
      const response = await api.get(`/Booking/${job.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      setJob(response.data);
    } catch (error) {
      console.error("Failed to fetch updated job status:", error);
    }
  };

  // Make sure the job exists
  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Job details not found</Text>
      </View>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { month: "2-digit", day: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Format time
  const formatTime = (start, end) => {
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    return `${new Date(start).toLocaleTimeString([], timeOptions)} - ${new Date(end).toLocaleTimeString([], timeOptions)}`;
  };

  const renderActionButton = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="#E9BB55" />;
    }

    if (job.status === "Scheduled") {
      return (
        <TouchableOpacity style={styles.startButton} onPress={() => handleAction("start")}>
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      );
    } else if (job.status === "InProgress") {
      return (
        <>
          <TouchableOpacity style={styles.completeButton} onPress={() => handleAction("complete")}>
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleAction("cancel")}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      );
    }

    return null;
  };

  const handleAction = async (actionType) => {
    if (actionType === "cancel") {
      Alert.alert(
        "Cancel Job",
        "Are you sure you want to cancel this job?",
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await api.post(`/Booking/${job.id}/Stop`, {}, {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  }
                });

                if (response.status === 204) {
                  console.log("Job successfully canceled");
                  fetchUpdatedJob();
                }
              } catch (error) {
                console.error("Failed to cancel job:", error);
              }
            },
          },
        ]
      );
      return;
    }

    try {
      let endpoint = "";

      if (actionType === "start") {
        endpoint = `/Booking/${job.id}/Start`;
      } else if (actionType === "complete") {
        endpoint = `/Booking/${job.id}/Complete`;
      }

      const response = await api.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });

      if (response.status === 204) {
        console.log(`Successfully updated job status via ${actionType}`);
        fetchUpdatedJob();
      }
    } catch (error) {
      console.error(`Failed to update job status via ${actionType}:`, error);
    }
  };

  return (
    <View style={styles.viewStyle}>
      <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
        <Text style={styles.Title}>Job Details</Text>
      </View>

      <View style={styles.dashboardAreaStyle}>
        <ScrollView style={styles.container}>

          {/*----- Status & Start Button -----*/}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{job.status == "InProgress" ? "In Progress" : job.status}</Text>
            <View style={styles.buttonRow}>
              {renderActionButton()}
            </View>
          </View>

          {/*----- Job Date, Time, Staff -----*/}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(job.startDate)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>{formatTime(job.startDate, job.endDate)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Staff:</Text>
              <Text style={styles.value}>{job.assignedStaff?.map(s => `${s.staff.firstName} ${s.staff.lastName}`).join(", ")}</Text>
            </View>
          </View>

          {/*----- Client Information -----*/}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.value}>{job.client.fullName} ({job.client.companyName})</Text>
            </View>
          </View>

          {/*----- Address + Map + Get Directions -----*/}
          <View style={styles.card}>
            <Text style={styles.label}>Address:</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={20} color="black" />
              <Text>{job.address}</Text>
            </View>
            {/* <Image source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?center=${job.latitude},${job.longitude}&zoom=15&size=300x150&maptype=roadmap&key=YOUR_GOOGLE_MAPS_API_KEY` }} style={styles.mapImage} /> */}
            <TouchableOpacity>
              <Text style={styles.getDirections}>Get Directions <Ionicons name="open-outline" size={16} color="blue" /></Text>
            </TouchableOpacity>
          </View>

          {/*----- Notes Section -----*/}
          <View style={styles.card}>
            <Text style={styles.label}>Notes:</Text>
            {job.notes && job.notes.length > 0 ? (
              job.notes.map((note, index) => (
                <View key={index} style={styles.note}>
                  <Text style={styles.noteAuthor}>{note.author}</Text>
                  <Text style={styles.noteText}>{note.text}</Text>
                  <Text style={styles.noteDate}>{formatDate(note.date)} {new Date(note.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}</Text>
                </View>
              ))
            ) : (
              <Text>No notes available</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
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
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 15,
  },
  header: {
    backgroundColor: "#2D4059",
    padding: 15,
    borderRadius: 10,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  startButton: {
    backgroundColor: "#02ee78",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  startButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF5A5F",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#4CD964",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  completeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 5,
    marginRight: 16
  },
  value: {
    fontSize: 16,
    color: "#333",
    flex: 2,
    textAlign: "right",
    lineHeight: 20,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapImage: {
    width: "100%",
    height: 120,
    borderRadius: 5,
    marginTop: 10,
  },
  getDirections: {
    color: "blue",
    fontSize: 14,
    marginTop: 5,
  },
  note: {
    backgroundColor: "#F1F1F1",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  noteAuthor: {
    fontWeight: "bold",
  },
  noteText: {
    marginTop: 5,
  },
  noteDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 3,
  },
  arrowIcon: {
    fontSize: 24,
    color: "#666",
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 5,
  },
})

export default ScheduleDetailScreen;
