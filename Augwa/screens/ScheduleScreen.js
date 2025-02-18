import React, { useState, useEffect, useContext } from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet, FlatList } from "react-native";
// import { ScrollView } from 'react-native-gesture-handler';
// import SearchBar from "../components/SearchBar";
import { getBooking } from "../components/Schedule";
import { augwaBlue, dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';

const ScheduleScreen = ({ navigation }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [search, setSearch] = useState('')
  // const [filtersearch, setFilterSearch] = useState([])
  const [selectedTab, setSelectedTab] = useState("Today");
  const { authToken, user } = useContext(AuthContext);

  // Update getDates to return actual dates for Past/Future
  const getDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (date) => date.toLocaleDateString().split("T")[0];

    return {
      Past: formatDate(yesterday),
      Today: formatDate(today),
      Future: formatDate(tomorrow),
    };
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Function to fetch booking
  const fetchBookings = async () => {
    setLoading(true);

    const result = await getBooking(authToken);

    if (result.success) {
      const assignedBookings = result.data.filter(booking => booking.assignedTo === user);

      setSchedule(assignedBookings);
    } else {
      console.error("Error fetching bookings:", result.error);
    }

    setLoading(false);
  };

  // Function to load the selectedTab jobs
  // Convert both dates to UTC strings before comparing
  // Modified filterJobs function to show proper date ranges
  const filterJobs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    return schedule.filter((job) => {
      const jobDate = new Date(job.startDate);
      jobDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

      if (selectedTab === "Today") {
        return jobDate.getTime() === today.getTime();
      } else if (selectedTab === "Past") {
        return jobDate.getTime() < today.getTime();
      } else if (selectedTab === "Future") {
        return jobDate.getTime() > today.getTime();
      }
      return false;
    });
  };

  const dates = getDates();

  const isJobEnabled = (startDate, status) => {
    if (status === 'cancelled' || status === 'completed') return false;

    const now = new Date();
    const jobStart = new Date(startDate);

    return jobStart > now;
  };

  // Get the street name in the address
  const getShortAddress = (address) => {
    return address ? address.split(",")[0] : "";
  };

  // Format time:
  // Current day: HH:mm AM/PM - HH:mm AM/PM
  // Not current day: MM/DD/YYYY HH:mm AM/PM - HH:mm AM/PM
  const formatJobTime = (startDate, endDate) => {
    const jobStart = new Date(startDate);
    const jobEnd = new Date(endDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const timeFormat = { hour: "2-digit", minute: "2-digit", hour12: true };
    const formattedStartTime = jobStart.toLocaleTimeString([], timeFormat);
    const formattedEndTime = jobEnd.toLocaleTimeString([], timeFormat);

    if (jobStart.toDateString() === today.toDateString()) {
      return `${formattedStartTime} - ${formattedEndTime}`;
    } else {
      const dateFormat = { month: "short", day: "2-digit" };
      const formattedDate = jobStart.toLocaleDateString("en-US", dateFormat);

      return `${formattedDate} ${formattedStartTime} - ${formattedEndTime}`;
    }
  };

  return (
    <View style={styles.viewStyle}>
      <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
        <Text style={styles.Title}>Schedule</Text>
      </View>
      <View style={styles.dashboardAreaStyle}>
        <View style={styles.tabNavigation}>
          {Object.entries(dates).map(([tab, date]) => (
            <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)}>
              <Text style={selectedTab === tab ? styles.selectedTab : styles.tabText}>{date}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Searcbar and menu options */}
        {/*   <View style = {styles.row}>
              <TouchableOpacity>
              <Ionicons name="options-outline" style = {styles.iconStyle}/>
              </TouchableOpacity>
            <SearchBar/>
            </View>  */}
        <View style={styles.Container}>
          {loading ? (
            <Text style={styles.msgText}>Loading jobs...</Text>
          ) : schedule.length > 0 ? (
            <FlatList
              data={filterJobs()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const enabled = isJobEnabled(item.startDate, item.status);

                return (
                  <View style={styles.jobCard}>
                    <View style={styles.Container}>

                      {/*----- Button -----*/}
                      <TouchableOpacity style={[styles.startButton, !enabled && styles.startButtonDisabled]}
                        disabled={!enabled}
                      >
                        <Text style={[styles.startButtonText,
                        !enabled && styles.startButtonTextDisabled]}>START</Text>
                      </TouchableOpacity>

                      <View style={styles.jobInfo}>
                        {/*----- Address -----*/}
                        {/*-- TODO: Click the address and navigate to the map --*/}
                        <View style={styles.JobView}>
                          <Ionicons name="location" style={styles.JobIcon} />
                          <Text> {getShortAddress(item.address)}</Text>
                        </View>

                        {/*----- Date & Time -----*/}
                        <View style={styles.JobView}>
                          <Ionicons name="time-outline" style={styles.JobIcon} />
                          <Text> {formatJobTime(item.startDate, item.endDate)}</Text>
                        </View>
                      </View>
                    </View>

                    {/*----- Status -----*/}
                    <View style={styles.jobStatus}>
                      <Text> {item.status}</Text>
                    </View>

                    {/*----- Arrow Icon -----*/}
                    <View style={styles.arrowIcon}>
                      <TouchableOpacity onPress={() => navigation.navigate("schedule_detail", { job: item })}>
                        <Ionicons name="chevron-forward" style={styles.arrowIcon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              }}
            />
          ) : (
            <Text style={styles.msgText}>
              No jobs found.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

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
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    backgroundColor: "#fff",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    borderRadius: 5,
    padding: 10
  },
  jobStatus: {
    flex: 0.4,
    textAlign: 'left',
  },
  arrowIcon: {
    fontSize: 20,
    marginLeft: 10,
    color: "#666",
  },
  Container: {
    flex: 1,
  },
  buttonstyle: {
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  JobView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    fontSize: 16
  },
  JobIcon: {
    fontSize: 20,
    alignSelf: 'center',
  },
  startButton: {
    backgroundColor: '#177de1',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: 80
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center'
  },
  msgText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  startButtonDisabled: {
    backgroundColor: '#cccccc',
  },
})

export default ScheduleScreen;
