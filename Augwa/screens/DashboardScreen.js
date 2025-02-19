import React, { useState, useEffect , useCallback} from 'react';
import base64 from 'base-64';
import axios from "axios"
import { View, StyleSheet, Text, TouchableOpacity, } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';
import { API_BASEPATH_DEV, X_DOMAIN } from '@env';
import { augwaBlue, dashboardArea, errorRed, navigateColor } from "../assets/styles/color";
import Message from '../components/Message'
// import Dashboard from '../components/Dashboard'
import BellIcon from '../components/BellIcon'
import Ionicons from '@expo/vector-icons/Ionicons';
import { isSearchBarAvailableForCurrentPlatform } from 'react-native-screens';
import {fetchJoblist} from '../components/FetchList'

const DashboardScreen = ({ route, navigation }) => {
  // const [username, setUsername] = useState('')

  // Initially job is not started
  const [jobStatus, setJobStatus] = useState('');
  const { authToken } = useContext(AuthContext); // get token from
  const { userName } = useContext(AuthContext);
  const [scheduleData, setScheduleData] = useState(null);
  const [error, setError] = useState(null);
  const [weeklyTasksNumber, setWeeklyTasks] = useState(0)

  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
      'Content-Type': 'application/json',
      'X-Domain': X_DOMAIN  // Ensure this header is correct
    }
  });

  useEffect(() => {
    if (authToken) {
      fetchJoblist(authToken, setScheduleData, setError);
      getWeeklyTaskCount();
    }
  }, [authToken]);
  // decode method
  const decodeJWT = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;

      const decodedPayload = base64.decode(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Failed decode:', error);
      return null;
    }
  };

  const payload = decodeJWT(authToken);
  const accountID = payload?.StaffId ?? null;

  console.log(`account id: ${accountID}`);

  /////////////////// naviagte to schedule///////////////////
  const gotoSchedule = () => {
    navigation.navigate("schedule");
  }
  // console.log(scheduleData)

  const userTasks = scheduleData?.filter(schedule =>
    schedule?.assignedStaff?.some(task => task?.staff.id === accountID)
  );
  // now user tasks are the tasks only belongs to me
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // fetch today's data only
  const matchedSchedules = userTasks?.filter((schedule) => {
    const isStatusValid = schedule?.status === "Scheduled";
    const startDate = schedule?.startDate ? new Date(schedule.startDate) : null;
    const isDateValid = startDate ? startDate > today : false;
    return isStatusValid && isDateValid;
  }) || [];
  console.log("total schedules length:", scheduleData?.length);
  console.log("Matched schedules length:", matchedSchedules?.length);
  // calculate the number of tasks within the week:
  const getWeeklyTaskCount = () => {
    if (!userTasks) return 0;
    // start of the week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    // end of the week
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // find tasks within the week range
    const weeklyTasks = userTasks.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate);
      return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
    });
    setWeeklyTasks(weeklyTasks.length);
    return weeklyTasksNumber;
  }; 
  console.log({weeklyTasksNumber});
  // button click to start the job
  // since current job is always the first
  const todayTaskList = (matchedSchedules || []).filter((schedule) => {
    if (!schedule?.startDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(schedule.startDate);
    startDate.setHours(0, 0, 0, 0); // Normalize startDate to avoid time mismatches

    return startDate.getTime() === today.getTime();
  });
  const current = todayTaskList[0]
  console.log(current);
  const countTodayTask = () => {
    let numTaskToday = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    matchedSchedules.forEach((schedule) => {
      const startDate = schedule?.startDate ? new Date(schedule.startDate) : null;
      if (startDate) {
        startDate.setHours(0, 0, 0, 0); // Normalize startDate to midnight

        if (startDate.getTime() === today.getTime()) {
          numTaskToday++; // Count tasks for today
        }
      }
    })
    return numTaskToday;
  };
  console.log(`number of tasks: ${countTodayTask()}`);

  // handle if this is null
  // console.log(`current task: ${current}`)
  const changeStatus = async () => {
    try {
      if (current.status === 'Scheduled') {
        const response = await api.patch(`/Booking/${current.id}`,
          { status: 'InProgress' },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
      } else if (current.status === 'InProgress') {
        const response = await api.patch(`/Booking/${current.id}`,
          { status: 'Completed' },
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
      }
    } catch (error) {
      if (error.response) {
        console.error("Error Response Status:", error.response.status);
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Headers:", error.response.headers);
        setError(`Server Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response received from server");
      } else {
        console.error("Request setup error:", error.message);
        setError(`Request Error: ${error.message}`);
      }
    }
  }
  return (
    <View style={[styles.viewStyle]}>
      {/* view for the top blue part */}
      <View style={{ backgroundColor: augwaBlue, marginTop: 70 }}>
        <View style={styles.greetingArea}>
          <Text style={styles.greetings}>Welcome, </Text>

          <View style={styles.iconSection}>
            <TouchableOpacity>
              <Message />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 20 }}>
              <BellIcon />
            </TouchableOpacity>
          </View>
        </View>
        {/* end of information area */}

        {/* display username */}
        <Text style={styles.usernameStyle}> {userName} !</Text>
      </View>

      {/* beginning of the dashboard view */}
      <View style={styles.dashboardAreaStyle}>
        {/* section title view */}
        <View style={{ marginLeft: 5, flexDirection: 'row', marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Current Job</Text>
          <Text style={styles.timeTitle}>{scheduleData?.results?.[0].startDate}</Text>
        </View>
        {/* end of section title view */}
        {/* jd,  btn */}
        <View style={{ flexDirection: 'row', marginTop: 20, marginLeft: 9 }}>
          <View style={styles.jobDescribtionStyle}>
            {todayTaskList[0] ? (
              <Text style={styles.jobDescribtionText}>
                {`${todayTaskList[0].address} ${todayTaskList[0].startDate}
                      Status: ${todayTaskList[0].status}`}
              </Text>
            ) : (
              <Text style={styles.jobDescribtionText}>No task today!</Text>
            )}
          </View>
          <View style={{ flexDirection: 'column', marginLeft: 12 }}>
            <TouchableOpacity style={[styles.btnStyle, { backgroundColor: augwaBlue }]}
              onPress={changeStatus}>
              <Text style={{ fontSize: 20, color: "white" }}>
                START JOB</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnStyle, { backgroundColor: navigateColor }]}>
              <View style={{ flexDirection: "row" }}>
                <Ionicons name="navigate-circle-outline" size={35} color="white" />
                <Text style={[styles.btnTitle,]}>Navigate</Text>
              </View>
            </TouchableOpacity>
            {/* end of two buttons view */}
          </View>
        </View>
        {/* end of Current job section btn view */}
        {/* section upcoming job view */}
        <View style={{ marginLeft: 5, flexDirection: 'row', marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
          <TouchableOpacity style={{ marginLeft: 150, marginTop: 5 }} onPress={gotoSchedule}>
            <Text style={styles.bluBtntext}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {matchedSchedules.slice(1).map((item, index) => (
            <View key={index} style={[styles.jobDescribtionStyle]}>
              <Text style={styles.jobDescribtionText}>{item.address} {item.startDate}</Text>
              {/* <Text style={styles.jobDescribtionText}> {item.startDate}</Text> */}
              <Text style={styles.jobDescribtionText}> {item.status}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ marginLeft: 5, flexDirection: 'row', marginTop: -30 }}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
        </View>
        <ScrollView horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {[`Today's tasks: `, "Weekly tasks ",].map((item, index) => (
            <View key={index} style={[styles.performanceStyle]}>
              <Text style={styles.sectionTitle}>{item}</Text>
              <Text style={styles.sectionTitle}>{todayTaskList.length}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      {/* end of the first section view */}
    </View>
  )
}

const styles = StyleSheet.create({
  viewStyle: {
    flex: 1,
    backgroundColor: augwaBlue,
  },
  greetingArea: {
    flexDirection: 'row',
    // backgroundColor: augwaBlue,
  },
  iconSection: {
    marginLeft: 150,
    marginTop: 20,
    flexDirection: "row"
  },
  greetings: {
    marginTop: 15,
    marginStart: 10,
    fontSize: 33,
    color: '#fff'

  },
  usernameStyle: {
    fontSize: 33,
    fontWeight: "500",
    marginTop: 10,
    marginStart: 10,
    color: '#fff'
  },
  dashboardAreaStyle: {
    marginTop: 20,
    // flex: 1,
    height: '85%',
    backgroundColor: dashboardArea,
    borderRadius: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#000',
    fontWeight: '500',
    marginLeft: 10
  },
  timeTitle: {
    color: '#000',
    marginTop: 5,
    marginLeft: 80,
    fontSize: 16,
    color: augwaBlue,
    fontWeight: '500'
  },
  jobDescribtionStyle: {
    backgroundColor: "#fff",
    width: 210,
    height: 125,
    borderRadius: 20,
    marginLeft: 10
  },
  jobDescribtionText: {
    marginTop: 10,
    marginLeft: 5,
    fontSize: 16
  },
  btnTitle: {
    fontSize: 20,
    color: "white",
    alignSelf: 'center'
  },

  btnStyle: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    width: 150,
    height: 50
  },
  bluBtntext: {
    marginTop: -5,
    fontSize: 17,
    color: '#177de1'
  },
  scrollContainer: {
    paddingHorizontal: 10,
    padding: 'auto',
    marginTop: 10,
    height: 70,
  },
  performanceStyle: {
    backgroundColor: "#fff",
    width: 150,
    height: 110,
    borderRadius: 20,
    marginLeft: 7
  }
});

export default DashboardScreen;