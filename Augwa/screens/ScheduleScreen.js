import React, {useState, useEffect, useContext} from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet,FlatList } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import SearchBar from "../components/SearchBar";
import { getBooking } from "../components/Schedule";
import { augwaBlue,dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../src/context/AuthContext';

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tabbar = ({ tabName }) => {
  switch (tabName) {
    case "Past":
      return <Text>Past</Text>;
    case "Today":
      return <Text>Today</Text>;
    case "Future":
      return <Text>Future</Text>;
    default: 
      return <Text>Today</Text>
  }
};


const ScheduleScreen = (props) => {
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filtersearch, setFilterSearch] = useState([])

    const [selectedTab, setSelectedTab] = useState("Today");

    const { authToken } = useContext(AuthContext);

    useEffect(() => {
      fetchBookings();
  }, []);

    // Function to fetch booking
    const fetchBookings = async () => {
      setLoading(true);
      const result = await getBooking(authToken);
      if (result.success) {
          setSchedule(result.data);  // Store fetched bookings
      } else {
          console.error("Error fetching bookings:", result.error);
      }
      setLoading(false);
  };

  // Function to load the selectedTab jobs
  const filterJobs = () => {
    const today = new Date(); 

    return schedule.filter((job) => {
        const jobDate = new Date(job.date); 

        if (selectedTab === "Today") {
            return (
                jobDate.getDate() === today.getDate() &&
                jobDate.getMonth() === today.getMonth() &&
                jobDate.getFullYear() === today.getFullYear()
            );
        } else if (selectedTab === "Past") {
            return jobDate < today; 
        } else if (selectedTab === "Future") {
            return jobDate > today; 
        }

        return false; 
    });
};


return (
    <View style = {[styles.viewStyle]}>
        <View style = {{ backgroundColor: augwaBlue, marginTop:40}}>
            <Text style = {[styles.Title]}>Schedule</Text>
        </View>
        <View style={styles.dashboardAreaStyle}>

        <View style={styles.tabNavigation}>
                    {["Past", "Today", "Future"].map((tab) => (
                        <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
                            <Text style={selectedTab === tab ? styles.selectedTab : styles.tabText}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

{/* Searcbar and menu options */}
          <View style = {styles.row}>
            <TouchableOpacity>
            <Ionicons name="options-outline" style = {styles.iconStyle}/>
            </TouchableOpacity>
          <SearchBar/>
          </View>

          <ScrollView style={{ flex: 1, marginBottom: 20 }}>
                    {loading ? (
                        <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
                        Loading jobs...
                    </Text>
                ) : schedule.length > 0 ? (
                        <FlatList
                            data={filterJobs()}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.jobCard}>
                                    <Text style={styles.jobTitle}>{item.serviceType}</Text>
                                    <Text>Date: {item.date}</Text>
                                    <Text>Time: {item.time}</Text>
                                    <Text>Location: {item.address}</Text>
                                </View>
                            )}
                            />
                        ) : (
                            <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
                                No jobs found.
                            </Text>
                        )}
                </ScrollView>
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
     Content: {
        fontSize: 15,
        marginLeft: 10,
        marginTop: 10,
        fontWeight: 'bold',
        color: '#000'
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
       
      },
      iconStyle: {
        color: '#000',
        fontSize: 30,
        marginTop:10,
        alignSelf: 'center',
        marginHorizontal: 15,
    },
    tabNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
  },
  tabText: {
      fontSize: 16,
      color: 'grey',
  },
  selectedTab: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#177de1', 
  },
})

export default ScheduleScreen;
