import React, { useState, useEffect} from 'react';
import axios from "axios"
import {View, StyleSheet, Text, TouchableOpacity, } from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import { ScrollView } from 'react-native-gesture-handler';
import { API_BASEPATH_DEV, X_DOMAIN } from '@env';
import {augwaBlue, dashboardArea, navigateColor} from "../assets/styles/color";
import Message from '../components/Message'
// import Dashboard from '../components/Dashboard'
import BellIcon from '../components/BellIcon'
import Ionicons from '@expo/vector-icons/Ionicons';

const DashboardScreen = ({ route, navigation }) => {
  const [username, setUsername] = useState('')
  // initially job is not started
  const [jobStart, setJobStart] = useState(false)
  const { authToken } = useContext(AuthContext) // get token from
  //console.log("authtoken:", authToken);
  const [scheduleData, setScheduleData] = useState(null)
  const [error, setError] = useState(null)

  const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
        'Content-Type': 'application/json',
        'X-Domain': X_DOMAIN  // Ensure this header is correct
    }
});

  useEffect(() => {
    if (authToken) {
      console.log('Fetching with token: ', authToken)
      fetchJoblist()
    }
    else {
      console.log("Now token available")
      setError('Authentication required')
    }
  }, [authToken])
  // useEffect(()=>{
  //   if(scheduleData){
  //     console.log('Processing schedule data...')
  //     process
  //   }
  // }

  // )

  const fetchJoblist = async () => {
    try {
      if (!authToken) {
        throw new Error("No authentication token available");
      }
      
      console.log('Making request to:', `${API_BASEPATH_DEV}/Booking`);
      console.log('Headers:', {
        'Authorization': `Bearer ${authToken.substring(0, 10)}...` // Log first 10 chars only
      });
  
      const response = await api.get(`${API_BASEPATH_DEV}/Booking`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      setScheduleData(response.data);
    } catch (error) {
      if (error.response) {
        // Server responded with error
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Headers:', error.response.headers);
        setError(`Server Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // Request made but no response
        console.error('Error Request:', error.request);
        setError('No response received from server');
      } else {
        // Error setting up request
        console.error('Error Message:', error.message);
        setError(`Error: ${error.message}`);
      }
    }
  };
  // console.log(scheduleData)
  // only prints out with jdahan account
  // to get client's address
  // console.log(scheduleData?.results?.[0]?.address);
  // to get the staff information
  console.log(scheduleData?.results?.[0]?.staff);
  // this is what staff obkect looks like:
  // [{"calendarId": "494264a7-f9b9-4df6-a03f-c8f8c1eb53a8", 
  //   "staff": {"accountLinked": true, "availability": [Array], 
  //     "calendar": [Array], "emailAddress": "qyu39@my.centennialcollege.ca", 
  //     "emailAddressStatus": "Unverifed", "firstName": "qianhui", 
  //     "id": "7487cc7b-c0e5-4aae-98d5-dd65b00067cb", "lastName": "yu", 
  //     "phoneNumber": "1111111111", "phoneNumberExtension": "", 
  //     "phoneNumberStatus": "Unverifed", "roleId": "293e37be-40a7-4c91-964d-5e62dfde3e18", 
  //     "status": "Active"}}]
  



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
        <Text style={styles.usernameStyle}>Display name here !</Text>
      </View>

      {/* beginning of the dashboard view */}
      <View style={styles.dashboardAreaStyle}>
        {/* section title view */}
        <View style={{ marginLeft: 5, flexDirection: 'row', marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Current Job</Text>
          <Text style={styles.timeTitle}>Job Time</Text>
        </View>
        {/* end of section title view */}
        {/* jd,  btn */}
        <View style={{ flexDirection: 'row', marginTop: 20, marginLeft: 9 }}>
          <View style={styles.jobDescribtionStyle}>
            <Text style={styles.jobDescribtionText}>
              display here
            </Text>
          </View>
          <View style={{ flexDirection: 'column', marginLeft: 12 }}>
            <TouchableOpacity style={[styles.btnStyle, { backgroundColor: augwaBlue }]}>
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
          <TouchableOpacity style={{ marginLeft: 150, marginTop: 5 }}>
            <Text style={styles.bluBtntext}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"].map((item, index) => (
            <View key={index} style={[styles.jobDescribtionStyle]}>
              <Text style={styles.jobDescribtionText}>{item}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={{ marginLeft: 5, flexDirection: 'row', marginTop: -30 }}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
        </View>
        <ScrollView horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}>
          {["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"].map((item, index) => (
            <View key={index} style={[styles.performanceStyle]}>
              <Text style={styles.jobDescribtionText}>{item}</Text>
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
    marginLeft: 150,
    fontSize: 16

  },
  jobDescribtionStyle: {
    backgroundColor: "#fff",
    width: 210,
    height: 125,
    borderRadius: 20,
    marginLeft: 10
  },
  jobDescribtionText: {
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

})
export default DashboardScreen
