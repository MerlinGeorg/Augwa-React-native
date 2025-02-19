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
  const [btnDisable, setBtnDisable] = useState(false)

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
    }
    // getWeeklyTaskCount();
  }, [authToken]);
  useEffect(() => {
    if (scheduleData && userTasks) {
      getWeeklyTaskCount();
    }
  }, [scheduleData, userTasks]);
  
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
  // format the time
  const formatLocalTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
  
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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
    const isStatusValid = schedule?.status === "Scheduled"||schedule?.status === "InProgress";
    const startDate = schedule?.startDate ? new Date(schedule.startDate) : null;
    const isDateValid = startDate ? startDate > today : false;
    return isStatusValid && isDateValid;
  }) || [];
  console.log("total schedules length:", scheduleData?.length);
  console.log("Matched schedules length:", matchedSchedules?.length);
  // calculate the number of tasks within the week:
  const getWeeklyTaskCount = async() => {
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
    // return weeklyTasksNumber;
  }; 
  console.log(`weekly tasks number Ho: ${weeklyTasksNumber}`);
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
  // for performance mapping
  const performances = [
    { title: "Today's tasks left:", count: todayTaskList.length },
    { title: 'Weekly tasks:\n', count: weeklyTasksNumber }
  ];
  const current = todayTaskList[0]
  console.log(current);
  const changeStatus = async () => {
    try {
      // Verify we have current task
      if (!current || !current.id || btnDisable) {
        console.log('No current task available:', current);
        return;
      }
  
      if (current.status === 'Scheduled') {
        setJobStatus('Scheduled')
        const response = await api.post(
          `/Booking/${current.id}/Start`,
          {},  
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          }
        );
        
        if (response.status === 200 || response.status === 204) {
          setJobStatus('InProgress');
          // re-fetch the job list
          fetchJoblist(authToken, setScheduleData, setError);
        }
      } 
      else if (current.status === 'InProgress') {
        const response = await api.post(
          `/Booking/${current.id}/Complete`,
          {}, 
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            }
          }
        );
        
        if (response.status === 200 || response.status === 204) {
          setJobStatus('Completed');
          setBtnDisable(true);
          // Refresh the job list
          fetchJoblist(authToken, setScheduleData, setError);
        }
      }
    } catch (error) {
      console.error('Status change error:', {
        endpoint: current?.status === 'Scheduled' ? 'Start' : 'Complete',
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please try logging in again.');
      } else {
        setError(`Failed to update status: ${error.message}`);
      }
    }
  };
  const renderActionButton = () => {
    if (btnDisable) {

      return (
        <TouchableOpacity 
          style={[styles.btnStyle, { backgroundColor: 'gray' }]}
          disabled={true}>
          <Text style={styles.btnTitle}>Finished</Text>
        </TouchableOpacity>
      );
    }

    const buttonConfig = {
      Scheduled: {
        color: augwaBlue,
        text: 'START JOB'
      },
      InProgress: {
        color: 'orange',
        text: 'In Progress...'
      }
    };
    const config = buttonConfig[current?.status] || buttonConfig.Scheduled;
    return (
      <TouchableOpacity 
        style={[styles.btnStyle, { backgroundColor: config.color }]}
        onPress={changeStatus}>
        <Text style={styles.btnTitle}>{config.text}</Text>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.timeTitle}>
            {current ? formatLocalTime(current.startDate) : ''}
          </Text>
        </View>
        {/* end of section title view */}
        {/* jd,  btn */}
        <View style={{ flexDirection: 'row', marginTop: 20, marginLeft: 9 }}>
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
            <TouchableOpacity style={[styles.btnStyle, { backgroundColor: navigateColor }]}>
              <View style={styles.navigateButton}>
                <Ionicons name="navigate-circle-outline" size={35} color="white" />
                <Text style={styles.btnTitle}>Navigate</Text>
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
              <Text style={styles.jobDescribtionText}>
              {`${item.address}\n${formatLocalTime(item.startDate)}\n
              Status: ${item.status}`}
              </Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ marginLeft: 5, flexDirection: 'row', marginTop: -30 }}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
        </View>
        <ScrollView horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {performances.map((item, index) => (
            <View key={index} style={[styles.performanceStyle]}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <Text style={styles.performanceNumStyle}>{item.count}</Text>
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
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: 'center'
  },
  performanceNumStyle:{
    fontSize: 25,
    fontWeight: '700',
    marginLeft: 10
  }

});

export default DashboardScreen;