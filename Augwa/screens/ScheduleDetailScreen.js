import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  SafeAreaView
} from "react-native";
import { augwaBlue, dashboardArea } from "../assets/styles/color";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../src/context/AuthContext";
import axios from "axios";
import { API_BASEPATH_DEV } from "@env";
import { openMapsWithDirections } from "../components/NativeMap";
import { ExpandableNote } from "../components/ExpandableNote";
import { CameraImagePicker } from "../components/CameraImagePicker";
import CustomAlert from "../components/CustomAlert";

import MotionDetection from "../components/MotionDetection";

const ScheduleDetailScreen = ({ route }) => {
  const { authToken, domain } = useContext(AuthContext);
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [imageData, setImageData] = useState(null);
  const [timeTrackingState, setTimeTrackingState] = useState(null);
  const [isTravelLoading, setIsTravelLoading] = useState(false);
  const baseURL = API_BASEPATH_DEV;
  const api = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
      "X-Domain": domain,
    },
  });

  const fetchTimeTrackingState = async () => {
    if (!job?.assignedStaff?.length) return;
  
    try {
      setIsTravelLoading(true);
      const staffId = job.assignedStaff[0]?.staff?.id;
      const response = await api.get(
        `/TimeTracking?staffId=${staffId}&page=1&pageSize=10`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
  
      const latestState = response.data?.results?.[0]?.state;
      setTimeTrackingState(latestState);
    } catch (error) {
      console.error("Failed to fetch time tracking state:", error);
    } finally {
      setIsTravelLoading(false);
    }
  };

  useEffect(() => {
    if (job) {
      fetchTimeTrackingState();
    }
  }, [job]);

  const fetchUpdatedJob = async () => {
    try {
      const response = await api.get(`/Booking/${jobId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      setJob(response.data);
    } catch (error) {
      console.error("Failed to fetch updated job status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdatedJob();
  }, []);

  const handleMotionDetected = useCallback(async () => {
    if (job?.status === "Scheduled") {
      try {
        console.log("Travel start......");
        const staffId = job.assignedStaff[0]?.staff?.id;

        const response = await api.post(
          `/TimeTracking`,
          {
            "staffId": `${staffId}`, 
            "state": "TravelStart",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.status === 204) {
          fetchUpdatedJob();
          console.log("Job marked as En Route");
        }
      } catch (error) {
        console.log(`error.response?.status: ${error.response?.status}`);
        if (error.response?.status === 401) {
          console.error("Authentication failed. Please try logging in again.");
        } else {
          console.error(`Failed to update status: ${error.message}`);
        }
      }
    }
  }, [job, jobId, authToken, fetchUpdatedJob]);
  
  const motionDetectionEnabled = job && timeTrackingState !== null && timeTrackingState !== "TravelStart";

  MotionDetection(motionDetectionEnabled, handleMotionDetected);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#177de1"
        style={{ marginTop: 50 }}
      />
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Job details not found</Text>
      </View>
    );
  }


  const formatDate = (dateString) => {
    const options = { month: "2-digit", day: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (start, end) => {
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    return `${new Date(start).toLocaleTimeString([], timeOptions)} - ${new Date(
      end
    ).toLocaleTimeString([], timeOptions)}`;
  };

  const renderActionButton = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="#E9BB55" />;
    }

    if (job?.status === "Scheduled") {
      return (
        <TouchableOpacity
          style={[styles.startButton, timeTrackingState === "TravelStart" && { backgroundColor: "#ccc" }]}
          onPress={() => handleAction("start")}
          disabled={timeTrackingState === "TravelStart"}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      );
    } else if (job.status === "InProgress") {

      return (
        <>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleAction("complete")}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        </>
      );
    }

    return null;
  };

  const handleTravelEnd = async () => {
    if (!job?.assignedStaff?.length) return;
  
    try {
      const staffId = job.assignedStaff[0]?.staff?.id;
  
      const payload = {
        staffId: staffId,
        state: "TravelEnd"
      };
  
      const response = await api.post("/TimeTracking", payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
  
      if (response.status === 204) {
        console.log("Travel End successfully recorded");
        setTimeTrackingState("TravelEnd");
        fetchUpdatedJob();
      }
    } catch (error) {
      console.error("Failed to record Travel End:", error);
    }
  };
  

  const handleAction = async (actionType) => {
    try {
      const staffId = job.assignedStaff[0]?.staff?.id;
      let payload = {};

      if (actionType === "start") {
        payload = {
          "staffId": `${staffId}`,
          "state": "BookingStart",
          "bookingId": `${jobId}`
        };
      } else if (actionType === "complete") {
        payload = {
          "staffId": `${staffId}`,
          "state": "BookingEnd"
        };
      }

      const response = await api.post(
        `/TimeTracking`, payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 204) {
        console.log(`Successfully updated job status via ${actionType}`);
        fetchUpdatedJob();
      }
    } catch (error) {
      console.error(`Failed to update job status via ${actionType}:`, error);
    }
  };

  const handleCaptureImage = async () => {
    CameraImagePicker(setImageData);
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() && !imageData) {
      Alert.alert("Error", "Please enter note content or select an image.");
      return;
    }

    try {
      const payload = {
        content: noteContent,
        imageData: imageData || null,
        visibility: "Private",
      };

      const response = await api.post(`/Booking/${jobId}/Notes`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        CustomAlert({
          title: "success",
          message: "Note added successfully!",
          onOk: () => { }
        })
        console.log("Note added successfully!");

        setModalVisible(false);
        setNoteContent("");
        setImageData(null);


        fetchUpdatedJob();
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleGetDirections = () => {
    openMapsWithDirections({
      latitude: job.latitude,
      longitude: job.longitude,
      address: job.address
    });
  };

  return (
    <SafeAreaView style={styles.viewStyle}>
      <View style={styles.dashboardAreaStyle}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>

          <View style={styles.statusContainer}>
            {isTravelLoading ? (
              <ActivityIndicator size="small" color="#177de1" />
            ) : (
              <Text style={styles.statusText}>
                {timeTrackingState === "TravelStart"
                  ? "En Route"
                  : job.status === "InProgress"
                  ? "In Progress"
                  : job.status}
              </Text>
            )}
            <View style={styles.buttonRow}>
              {timeTrackingState === "TravelStart" ? (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleTravelEnd}
                >
                  <Text style={styles.completeButtonText}>Travel End</Text>
                </TouchableOpacity>
              ) : (
                renderActionButton()
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(job.startDate)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {formatTime(job.startDate, job.endDate)}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.value}>
                {job.client.firstName} {job.client.lastName}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Address:</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={20} color="black" />
              <Text>{job.address}</Text>
            </View>

            <TouchableOpacity onPress={handleGetDirections}>
              <Text style={styles.getDirections}>
                Get Directions{" "}
                <Ionicons name="open-outline" size={16} color="blue" />
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Job Details:</Text>
            {job.items && job.items.length > 0 ? (
              job.items.map((item, index) => (
                <View key={index}>
                  <View style={styles.row}>
                    <Text style={styles.jobLabel}>Job</Text>
                    <Text style={styles.jobValue}>{item.name}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.jobLabel}>Type</Text>
                    <Text style={styles.jobValue}>{item.itemType}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.jobLabel}>Description</Text>
                    <Text style={styles.jobValue}>
                      {item.description || "N/A"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text>No job detials available</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.notesHeader}>
              <Text style={styles.label}>Notes:</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons name="add-circle-outline" size={26} color="blue" />
              </TouchableOpacity>
            </View>


            {job.notes && job.notes.length > 0 ? (
              job.notes.map((note, index) => (

                <ExpandableNote key={index} note={note} />

              ))
            ) : (
              <Text>No notes available</Text>
            )}
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Note</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter note..."
                  value={noteContent}
                  onChangeText={setNoteContent}
                />
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handleCaptureImage}
                >
                  <Ionicons name="image-outline" size={24} color="white" />
                  <Text style={styles.imageButtonText}>Attach Image</Text>
                </TouchableOpacity>
                {imageData && (
                  <Image
                    source={{ uri: `data:image/png;base64,${imageData}` }}
                    style={styles.previewImage}
                  />
                )}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelNoteButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelNoteButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddNote}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    backgroundColor: augwaBlue,

  },
  scrollContainer: {
    paddingBottom: 70,
    marginLeft: 20,
    marginRight: 20
  },
  dashboardAreaStyle: {
    height: "110%",
    backgroundColor: dashboardArea,
    borderRadius: 30,
  },
  Title: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
    position: "relative",
    top: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingBottom: 20,
    borderRadius: 30,
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
    marginRight: 16,
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
  jobLabel: {
    fontWeight: "bold",
    fontSize: 14,
    width: 100,
  },
  jobValue: {
    fontSize: 14,
    flex: 1,
    color: "#333",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#666",
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    height: 80,
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CD964",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButtonText: {
    color: "#FFF",
    marginLeft: 10,
  },
  cancelNoteButton: {
    backgroundColor: "#FF5A5F",
    padding: 10,
    borderRadius: 5,
  },
  cancelNoteButtonText: {
    color: "#FFF",
  },
  addButton: {
    backgroundColor: "#177de1",
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#FFF",
  },
});

export default ScheduleDetailScreen;