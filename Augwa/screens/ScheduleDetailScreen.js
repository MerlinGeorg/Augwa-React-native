import React, { useEffect, useState, useContext } from "react";
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
import { API_BASEPATH_DEV, X_DOMAIN } from "@env";
//import * as ImagePicker from "expo-image-picker";
import { openMapsWithDirections } from "../components/NativeMap";
import { ExpandableNote } from "../components/ExpandableNote";
import { CameraImagePicker } from "../components/CameraImagePicker";
import CustomAlert from "../components/CustomAlert";

const ScheduleDetailScreen = ({ route }) => {
  const { authToken } = useContext(AuthContext);
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [imageData, setImageData] = useState(null);
  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
      "Content-Type": "application/json",
      "X-Domain": X_DOMAIN,
    },
  });

  const fetchUpdatedJob = async () => {
    try {
      const response = await api.get(`/Booking/${jobId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
     // console.log("jobId: ", jobId);
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

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#177de1"
        style={{ marginTop: 50 }}
      />
    );
  }

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
    return `${new Date(start).toLocaleTimeString([], timeOptions)} - ${new Date(
      end
    ).toLocaleTimeString([], timeOptions)}`;
  };

  const renderActionButton = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="#E9BB55" />;
    }

    if (job.status === "Scheduled") {
      return (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleAction("start")}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      );
    } else if (job.status === "InProgress") {
      //  console.log("job: ", job.items);

      return (
        <>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleAction("complete")}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleAction("cancel")}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </>
      );
    }

    return null;
  };

  const handleAction = async (actionType) => {
    if (actionType === "cancel") {
      Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.post(
                `/Booking/${job.id}/Stop`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                  },
                }
              );

              if (response.status === 204) {
                console.log("Job successfully canceled");
                fetchUpdatedJob();
              }
            } catch (error) {
              console.error("Failed to cancel job:", error);
            }
          },
        },
      ]);
      return;
    }

    try {
      let endpoint = "";

      if (actionType === "start") {
        endpoint = `/Booking/${job.id}/Start`;
      } else if (actionType === "complete") {
        endpoint = `/Booking/${job.id}/Complete`;
      }

      const response = await api.post(
        endpoint,
        {},
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

  // Add notes
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
    //  console.log("payload", payload);

      const response = await api.post(`/Booking/${jobId}/Notes`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        CustomAlert({
          title: "success",
          message: "Note added successfully!",
          onOk: () => {}
        })
        console.log("Note added successfully!");
        // Close the modal and reset the note and image
        setModalVisible(false);
        setNoteContent("");
        setImageData(null);

        // Update the screen
        fetchUpdatedJob();
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  //pass data to map
  const handleGetDirections = () => {
    openMapsWithDirections({
      latitude: job.latitude,
      longitude: job.longitude,
      // address: job.address
    });
  };

  return (
    <SafeAreaView style={styles.viewStyle}>
      <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
        <Text style={styles.Title}>Job Details</Text>
      </View>

      <View style={styles.dashboardAreaStyle}>
        <ScrollView style={styles.container} contentContainerStyle = { styles.scrollContainer}>
          {/*----- Status & Start Button -----*/}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {job.status == "InProgress" ? "In Progress" : job.status}
            </Text>
            <View style={styles.buttonRow}>{renderActionButton()}</View>
          </View>

          {/*----- Status & Start Button -----*/}
          {/* <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={24} color="#333" />
            </View>
            <View style={styles.row}>
               <Text style={styles.timeText}>{formatTime(time)}</Text>
          <Text style={styles.dateText}>{displayDate}</Text> 
            </View>
          </View> */}

          {/*----- Job Date and Time -----*/}
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

          {/*----- Client Information -----*/}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Client:</Text>
              <Text style={styles.value}>
                {job.client.fullName} ({job.client.companyName})
              </Text>
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
            <TouchableOpacity onPress={handleGetDirections}>
              <Text style={styles.getDirections}>
                Get Directions{" "}
                <Ionicons name="open-outline" size={16} color="blue" />
              </Text>
            </TouchableOpacity>
          </View>

          {/*----- Job details -----*/}
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

          {/*----- Notes Section -----*/}
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

          {/*----- Modal for Adding Notes -----*/}
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
  //  paddingHorizontal: 10
  },
   scrollContainer: {
     paddingBottom: 70, // Added padding to the bottom
 },
  dashboardAreaStyle: {
    marginTop: 20,
    height: "100%",
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
    width: 100, // Fixed width for alignment
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
