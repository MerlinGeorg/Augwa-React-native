import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Linking, Platform } from "react-native";
import base64 from "base-64";
import axios from "axios";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../src/context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";
import { API_BASEPATH_DEV } from "@env";
import {
  augwaBlue,
  dashboardArea,
  errorRed,
  navigateColor,
} from "../assets/styles/color";
import Message from "../components/Message";
import BellIcon from "../components/BellIcon";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchJoblist } from "../components/FetchList";
import MapView from "react-native-maps";
import GeofencingComponent from "../components/GeoFencing";
import { SafeAreaView } from "react-native-safe-area-context";

const DashboardScreen = ({ route, navigation }) => {
  const [jobStatus, setJobStatus] = useState("");
  const { authToken, userName, domain } = useContext(AuthContext);
  const [scheduleData, setScheduleData] = useState(null);
  const [error, setError] = useState(null);
  const [weeklyTasksNumber, setWeeklyTasks] = useState(0);
  const [taskLatitude, setTaskLatitude] = useState(null);
  const [taskLongitude, setTaskLongitude] = useState(null);
  const [onBreak, setOnBreak] = useState(false);
  const [onMealBreak, setOnMealBreak] = useState(false);
  const [clockIn, setClockIn] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const workTimeRef = useRef({
    total: 0,
    lastStart: null,
    isWorking: false,
    dailyReset: null
  });

  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
      "Content-Type": "application/json",
      "X-Domain": domain,
    },
  });
  const decodeJWT = (token) => {
    try {
      if (!token) {
        console.log("No token provided for decoding");
        return null;
      }

      const parts = token.split(".");
      if (parts.length < 2) {
        console.log("Invalid token format");
        return null;
      }

      const decodedPayload = base64.decode(
        parts[1].replace(/-/g, "+").replace(/_/g, "/")
      );
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Failed decode:", error);
      return null;
    }
  };
  useEffect(() => {
    if (authToken) {
      fetchJoblist(authToken, domain, setScheduleData, setError);
    }
  }, [authToken]); 
  console.log(authToken)
  useEffect(() => {
    if (scheduleData && userTasks) {
      getWeeklyTaskCount();
    }
  }, [scheduleData, userTasks]);

  useEffect(() => {
    if (current?.status === "Completed") {
      setJobStatus("Completed");
    } else {
      setJobStatus(current?.status || "");
    }
  }, [current]);
  useEffect(()=>{
    const scheduleDailyReset = ()=>{
      const now = new Date();
      const midNight = new Date(now);
      midNight.setDate(now.getDate() + 1);
      midNight.setHours(0, 0, 0, 0);
    

    const timeOutId = setTimeout(()=>{
      workTimeRef.current.total = 0;
      setDisplayTime(0);
      scheduleDailyReset(); 
    }, midNight - now);
    workTimeRef.current.dailyReset = timeOutId;
  };
    scheduleDailyReset();
  return ()=> clearTimeout(workTimeRef.current.dailyReset);}, []);
  useEffect(()=>{
    let interval;
    if (workTimeRef.current.isWorking) {
      workTimeRef.current,lastStart = Date.now();

      interval = setInterval(()=>{
        const now = Date.now();
        const elapsed = now - workTimeRef.current.lastStart
        workTimeRef.current.total += elapsed;
        workTimeRef.current.lastStart = now;
        setDisplayTime(prev => prev + elapsed)
      }, 1000)
    }
    return ()=>{
      if (interval) clearInterval(interval)
      if(workTimeRef.current.isWorking) {
        workTimeRef.current.total += Date.now() - workTimeRef.current.lastStart
      }
    }

  }, [workTimeRef.current.isWorking])
  
  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds/1000);
    const hours = Math.floor(totalSeconds/3600);
    const minutes = Math.floor((totalSeconds % 360) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}
    :${seconds.toString().padStart(2, '0')}`;
  },[])
  const formatLocalTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const payload = authToken ? decodeJWT(authToken) : null;
  const accountID = payload?.StaffId ?? null;

  console.log(`account id: ${accountID}`);

  const gotoSchedule = () => {
    navigation.navigate("Schedule");
  };

  const userTasks = useMemo(() => {
    return (
      scheduleData?.filter((schedule) =>
        schedule?.assignedStaff?.some((task) => task?.staff.id === accountID)
      ) || []
    );
  }, [scheduleData, accountID]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const matchedSchedules =
    userTasks?.filter((schedule) => {
      const isStatusValid =
        schedule?.status === "Scheduled" || schedule?.status === "InProgress";
      const startDate = schedule?.startDate
        ? new Date(schedule.startDate)
        : null;
      const isDateValid = startDate ? startDate > today : false;
      return isStatusValid && isDateValid;
    }) || [];
  console.log("total schedules length:", scheduleData?.length);
  console.log("Matched schedules length:", matchedSchedules?.length);
  console.log("Assigned sfaff:", matchedSchedules[0]?.assignedStaff);


  const getWeeklyTaskCount = async () => {
    if (!userTasks) return 0;

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyTasks = userTasks.filter((schedule) => {
      const scheduleDate = new Date(schedule.startDate);
      return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
    });
    setWeeklyTasks(weeklyTasks.length);
  };
  console.log(`weekly tasks number Ho: ${weeklyTasksNumber}`);

  const todayTaskList = (matchedSchedules || []).filter((schedule) => {
    if (!schedule?.startDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(schedule.startDate);
    startDate.setHours(0, 0, 0, 0);

    return startDate.getTime() === today.getTime();
  });
  console.log("matchedSchedules: ", matchedSchedules)

  const current = todayTaskList[0];



  const openMap = useCallback(async (latitude, longitude, address) => {
    
    console.log("Map Opening Process Started", {
      inputLatitude: latitude,
      inputLongitude: longitude,
      inputAddress: address,
      platform: Platform.OS,
    });

   
    const parsedLat = parseFloat(latitude);
    const parsedLong = parseFloat(longitude);

    
    if (isNaN(parsedLat) || isNaN(parsedLong)) {
      console.error("Invalid coordinates:", { latitude, longitude });
      Alert.alert("Navigation Error", "Invalid location coordinates", [
        { text: "OK", style: "cancel" },
      ]);
      return;
    }

    if (
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLong < -180 ||
      parsedLong > 180
    ) {
      console.error("Coordinates out of valid range:", {
        parsedLat,
        parsedLong,
      });
      Alert.alert(
        "Navigation Error",
        "Location coordinates are out of valid range",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    const formattedAddress = address ? encodeURIComponent(address) : '';

    try {
      const mapSchemes = {
        ios: [

          `maps://app?saddr=Current%20Location&daddr=${parsedLat},${parsedLong}&dirflg=d&t=m&directionsmode=driving`,
          `maps:?saddr=Current%20Location&daddr=${parsedLat},${parsedLong}&directionsmode=driving`,
          `https://www.google.com/maps/dir/?api=1&destination=${parsedLat},${parsedLong}&destination_place_id=${formattedAddress}&travelmode=driving`,
        ],
        android: [
          `google.navigation:q=${parsedLat},${parsedLong}&mode=d`,
          `geo:${parsedLat},${parsedLong}?q=${parsedLat},${parsedLong}(${formattedAddress})`,
          `https://www.google.com/maps/dir/?api=1&destination=${parsedLat},${parsedLong}&destination_place_id=${formattedAddress}&travelmode=driving`,
        ],
      };

      const currentPlatformSchemes =
        Platform.OS === "ios" ? mapSchemes.ios : mapSchemes.android;
      for (const scheme of currentPlatformSchemes) {
        try {
          const canOpen = await Linking.canOpenURL(scheme);
          console.log(`Attempting scheme: ${scheme}`, `Can open: ${canOpen}`);
          if (canOpen) {
            await Linking.openURL(scheme);
            console.log("Map opened successfully with scheme:", scheme);
            return;
          }
        } catch (schemeError) {
          console.error(`Error with scheme ${scheme}:`, schemeError);
        }
      }
      throw new Error("No map application could be opened");
    } catch (error) {
      console.error("Comprehensive Map Opening Error:", {
        errorMessage: error.message,
        latitude: parsedLat,
        longitude: parsedLong,
        address: formattedAddress,
        platform: Platform.OS,
      });
      Alert.alert("Navigation Error", "Could not open maps application", [
        { text: "OK", style: "cancel" },
      ]);
    }
  }, []);
  
  console.log(`current id: ${current?.id}`)

  const changeStatus = async () => {
    try {
      if (!current || !current.id) {
        console.log("No current task available:", current);
        return;
      }

      if (current.status === "Scheduled") {
        if(!workTimeRef.current.isWorking){
          workTimeRef.current.isWorking = true;
          workTimeRef.current.lastStart = Date.now()
        }
        const response = await api.post(
          `/TimeTracking`,
          {
            "staffId": `${accountID}`,
            "state": "BookingStart",
            "bookingId": `${current.id}`
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.status === 200 || response.status === 204) {
          setJobStatus("InProgress");
          fetchJoblist(authToken, domain, setScheduleData, setError);
        }
      } else if (current.status === "InProgress") {
        const remainingTask = todayTaskList.filter(
          task =>(task.status !== 'Completed'))
        if (remainingTask.length <= 0) {
          workTimeRef.current.isWorking = false
        }
        const response = await api.post(
          `/TimeTracking`,
          {
            "staffId": `${accountID}`,
            "state": "BookingEnd",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (response.status === 200 || response.status === 204) {
          setJobStatus("Completed");

          fetchJoblist(authToken, domain, setScheduleData, setError);
        }
      }
    } catch (error) {
      console.error("Status change error:", {
        endpoint: current?.status === "Scheduled" ? "Start" : "Complete",
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        setError("Authentication failed. Please try logging in again.");
      } else {
        setError(`Failed to update status: ${error.message}`);
      }
    }
  };
  const destination = {
    latitude: taskLatitude,
    longitude: taskLongitude,
  };
  const renderActionButton = () => {
    const isCompleted = current?.status === "Completed";
    const hasValidTask = current && !isCompleted;

    const buttonConfig = {
      Scheduled: {
        color: augwaBlue,
        text: "START JOB",
        disabled: false,
      },
      InProgress: {
        color: "orange",
        text: "In Progress",
        disabled: false,
      },
      Completed: {
        color: "gray",
        text: "Finished",
        disabled: true,
      },
    };
    const config = current?.status ?
      buttonConfig[current.status]
      : { color: 'gray', text: 'Start', disabled: true };

    return (
      <TouchableOpacity
        style={[
          styles.btnStyle,
          {
            backgroundColor: config.color,
            opacity: hasValidTask ? 1 : 0.6,
          },
        ]}
        onPress={hasValidTask ? changeStatus : null}
        disabled={!hasValidTask}
      >
        <Text style={styles.btnTitle}>{config.text}</Text>
      </TouchableOpacity>
    );
  };

  const renderNavigateButton = () => {
    const isCompleted = current?.status === "Completed";
    const hasValidTask = current && !isCompleted;
    const buttonConfig = {
      disabled: false,
      color: augwaBlue,
    };
    const config = current ? buttonConfig : { color: "gray", disabled: true };

    return (
      <TouchableOpacity
        style={[
          styles.btnStyle,
          { backgroundColor: config.color, opacity: hasValidTask ? 1 : 0.6 },
        ]}
        onPress={hasValidTask ? () => {
          openMap(current?.latitude,
            current?.longitude, current?.address);
          setTaskLatitude(current?.latitude); setTaskLongitude(current?.longitude)
        } : null}
        disabled={!hasValidTask}>
        <View style={styles.navigateButton}>
          <Ionicons name="navigate-circle-outline" size={30} color="white" />
          <Text style={styles.btnTitle}>Travel</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBreakBtn = () => {
    const handleBreak = async (type) => {
      try {
        const isStarting = type === 'break' ? !onBreak : !onMealBreak;
        const state = type === 'break' 
          ? (isStarting ? "BreakStart" : "BreakEnd")
          : (isStarting ? "MealBreakStart" : "MealBreakEnd");
  
        if (type === 'break') {
          setOnBreak(isStarting);
        } else {
          setOnMealBreak(isStarting);
        }
  
        if (isStarting) {
          if (workTimerRef.current.isWorking) {
            const currentTime = Date.now();
            workTimerRef.current.total += currentTime - workTimerRef.current.lastStart;
            workTimerRef.current.isWorking = false;
          }
        } else {
          if (jobStatus === 'InProgress') {
            workTimerRef.current.lastStart = Date.now();
            workTimerRef.current.isWorking = true;
          }
        }
        const response = await api.post(
          '/TimeTracking',
          {
            "staffId": `${accountID}`,
            "state": state
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!(response.status === 200 || response.status === 204)) {
          if (type === 'break') {
            setOnBreak(!isStarting);
          } else {
            setOnMealBreak(!isStarting);
          }
          Alert.alert('Error', 'Failed to update break status');
        }
  
      } catch (error) {
        if (type === 'break') {
          setOnBreak(!isStarting);
        } else {
          setOnMealBreak(!isStarting);
        }
        Alert.alert('Error', error.message);
      }
    };
  
    return (
      <View style={{ 
        flexDirection: "row", 
        marginLeft: 12,
        marginTop: 10,     
      }}>
    
        <TouchableOpacity
          style={[
            styles.statusBtnStyle,
            {
              backgroundColor: onBreak ? errorRed : '#4CAF50', 
              marginLeft: 10
            }
          ]}
          onPress={() => handleBreak('break')}>
          <Text style={styles.btnTitle}>
            {onBreak ? "END BREAK" : "START BREAK"}
          </Text>
        </TouchableOpacity>
  
    
        <TouchableOpacity
          style={[
            styles.statusBtnStyle,
            {
              backgroundColor: onMealBreak ? errorRed : '#4CAF50',
              marginLeft: 49
            }
          ]}
          onPress={() => handleBreak('meal')}>
          <Text style={styles.btnTitle}>
            {onMealBreak ? "END MEAL" : "START MEAL"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const performances = [
    { title: "Open daily task:", count: todayTaskList.length },
    { title: "Weekly tasks:", count: weeklyTasksNumber },
    { title: "Total Work Time:", count: formatTime(displayTime) },

  ];


  return (

    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>


        <View >
          <View style={styles.greetingArea}>
            <Text style={styles.greetings}>Welcome, </Text>

            <View style={styles.iconSection}>
    
              <TouchableOpacity style={{ marginLeft: 40 }}>
                <BellIcon />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.usernameStyle}> {userName} !</Text>
        </View>


        <View style={styles.dashboardAreaStyle}>

          <View style={{ flexDirection: 'row', marginTop: 20, }}>
            <View style={[{ flexDirection: 'row' }]}>
              <Text style={styles.sectionTitle}>Current Job</Text>
              <Text style={styles.timeTitle}>
                {current ? formatLocalTime(current.startDate) : ''}
              </Text>
            </View>

          </View>
          <View style={{ flexDirection: 'row', marginLeft: 9, marginTop: 10 }}>
            <View style={styles.jobDescribtionStyle}>
              {todayTaskList[0] ? (
                <Text style={styles.jobDescribtionText}>
                  {`${current.address}\n${formatLocalTime(current.startDate)}\n
                Status: ${current.status}`}
                </Text>
              ) : (
                <Text style={styles.jobDescribtionText}>No task today!</Text>
              )}
            </View>
            <View style={{ flexDirection: 'column', marginLeft: 12 }}>
              {renderActionButton()}
              {renderNavigateButton()}

            </View>
          </View>

          <View style={styles.statusBtnView}>
            {renderBreakBtn()}
          </View>

          <GeofencingComponent destination={destination} radius={50} />

          <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
            <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
            <TouchableOpacity style={{ marginRight: 15, marginTop: 5 }} onPress={gotoSchedule}>
              <Text style={styles.bluBtntext}>View all</Text>
            </TouchableOpacity>
          </View>
          {matchedSchedules.length === 0 ? (
            <Text style={styles.noJobsText}>No jobs available</Text>
          ) : (
            <ScrollView horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}>
              {matchedSchedules.map((item, index) => (
                <View key={index} style={[styles.jobDescribtionStyle]}>
                  <Text style={styles.jobDescribtionText}>
                    {`${item.address}\n${formatLocalTime(item.startDate)}\n
              Status: ${item.status}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )

          }

          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
          </View>
          <ScrollView horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 10, 
              alignItems: 'center',
            }}>
            {performances.map((item, index) => (
              <View key={index} style={[styles.performanceStyle]}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <Text style={styles.performanceNumStyle}>{item.count}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
       
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: augwaBlue,
  },
  headerContainer: {
  },
  viewStyle: {
    flex: 1,
    backgroundColor: augwaBlue,
  },
  greetingArea: {
    flexDirection: "row",
  },
  iconSection: {
    marginLeft: 150,
    marginTop: 20,
    flexDirection: "row",
  },
  noJobsText: {
    backgroundColor: "white",
    fontSize: 16,
    textAlign: "center",
    margin: 10,
    padding: 20,
    backgroundColor: "#fff",
    width: "auto",
    height: "15 %",
    borderRadius: 20,
  },
  greetings: {
    marginTop: 15,
    marginStart: 10,
    fontSize: 33,
    color: "#fff",
  },
  usernameStyle: {
    fontSize: 33,
    fontWeight: "500",
    marginTop: 10,
    marginStart: 10,
    color: "#fff",
  },
  dashboardAreaStyle: {
    marginTop: 20,
    height: "85%",
    backgroundColor: dashboardArea,
    borderRadius: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#000",
    fontWeight: "500",
    marginLeft: 20,
    alignSelf: 'center'
  },
  timeTitle: {
    color: "#000",
    marginTop: 10,
    paddingTop: 20,
    marginLeft: 80,
    fontSize: 16,
    color: augwaBlue,
    fontWeight: "500",
  },
  jobDescribtionStyle: {
    backgroundColor: "#fff",
    width: 200,
    height: 120,
    borderRadius: 20,
    marginLeft: 10,

  },
  jobDescribtionText: {
    padding: 10,
    fontSize: 16,
    alignItems: 'center'
  },
  btnTitle: {
    fontSize: 18,
    color: "white",
    alignSelf: "center",
  },

  btnStyle: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    width: 150,
    height: 50
  },
  bluBtntext: {
    marginTop: -5,
    fontSize: 17,
    color: "#177de1",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingRight: 20,
    paddingLeft: 10,
    marginTop: 10,
  },
  performanceStyle: {
    width: 170,
    height: 100,
    marginHorizontal: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
   
  },
  performanceNumStyle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  retryText: {
    color: augwaBlue,
    fontWeight: "bold",
  },
  statusBtns: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  statusBtnStyle: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    padding: 10,
    width: 150,
    height: 50

  }

});

export default DashboardScreen;
