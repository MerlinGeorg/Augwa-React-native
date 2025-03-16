import React, { useState, useEffect, useContext } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity, Text, Button, View, StyleSheet, FlatList } from "react-native";
import { getBooking } from "../components/Schedule";
import { augwaBlue, dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';

const ScheduleScreen = ({ navigation }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  // Function to fetch booking
  const fetchBookings = async () => {
    setLoading(true);

    const result = await getBooking(authToken, domain);

    if (result.success) {
      const assignedBookings = result.data.filter(booking => booking.assignedTo === user);
      setSchedule(assignedBookings);
      AllBookings(assignedBookings, selectedDate); 
    } else {
      console.error("Error fetching bookings:", result.error);
    }

    setLoading(false);
  };

  const AllBookings = (bookings) => {
    const agendaData = {};

    bookings.forEach(booking => {
      const jobDate = new Date(booking.startDate).toISOString().split('T')[0]; 

      if (!agendaData[jobDate]) {
        agendaData[jobDate] = [];
      }
      agendaData[jobDate].push(booking);
    });
    setAgendaItems(agendaData);
  };


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
      //const dateFormat = { month: "short", day: "2-digit" };
      //const formattedDate = jobStart.toLocaleDateString("en-US", dateFormat);

      return ` ${formattedStartTime} - ${formattedEndTime}`;
    }
  };

  // Function to render each job item in the agenda
  const renderItem = (item) => {
    const enabled = isJobEnabled(item.startDate, item.status);
    
    return (
      <View style={styles.jobCard}>
        <View style={styles.Container}>
          {/*----- Button -----*/}
          <TouchableOpacity 
            style={[styles.startButton, !enabled && styles.startButtonDisabled]}
            disabled={!enabled}
          >
            <Text style={[styles.startButtonText, !enabled && styles.startButtonDisabled]}>
              START
            </Text>
          </TouchableOpacity>

          <View style={styles.jobInfo}>
            {/*----- Address -----*/}
            <View style={styles.JobView}>
              <Ionicons name="location" style={styles.JobIcon} />
              <Text>{getShortAddress(item.address)}</Text>
            </View>

            {/*----- Date & Time -----*/}
            <View style={styles.JobView}>
              <Ionicons name="time-outline" style={styles.JobIcon} />
              <Text>{formatJobTime(item.startDate, item.endDate)}</Text>
            </View>
          </View>
        </View>

        {/*----- Status -----*/}
        <View style={styles.jobStatus}>
          <Text>{item.status === "InProgress" ? "In Progress" : item.status}</Text>
        </View>

        {/*----- Arrow Icon -----*/}
        <View style={styles.arrowIcon}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("ScheduleDetail", { jobId: item.id })}
            testID={`chevron-button-${item.id}`}
          >
            <Ionicons name="chevron-forward" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Function to render empty data for a day
  const renderEmptyData = () => {
    return (
      <View style={styles.emptyDate}>
        <Text style={styles.msgText}>No jobs scheduled for this date.</Text>
      </View>
    );
  };

  return (
    <View style={styles.viewStyle}>
      <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
        <Text style={styles.Title}>Schedule</Text>
      </View>
      <View style={styles.dashboardAreaStyle}>

        <View style={styles.Container}>
          {loading ? (
            <View style={styles.loadingContainer}>
            <Text style={styles.msgText}>Loading jobs...</Text>
          </View>
          ) :  (
            <Agenda
            items={agendaItems}
            selected={selectedDate}
            onDayPress={(day) => {
              console.log("selected date: ", day.dateString)
              setSelectedDate(day.dateString)}}
              renderItem={renderItem}
            renderEmptyDate={renderEmptyData}
            renderEmptyData={renderEmptyData}
            rowHasChanged={(r1, r2) => r1.id !== r2.id}
            showClosingKnob={true}
            
            theme={{
              calendarBackground: '#ffffff',
              selectedDayBackgroundColor: '#177de1',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#177de1',
              dayTextColor: '#2d4150',
              textSectionTitleColor: '#177de1',
              dotColor: '#177de1',
              selectedDotColor: '#ffffff',
              arrowColor: '#177de1',
              monthTextColor: '#177de1',
              agendaDayTextColor: '177de1',
              agendaDayNumColor: '177de1',
              agendaTodayColor: '177de1',
              agendaKnobColor: '#177de1'
            }}
            style = {styles.agendaStyle}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
    backgroundColor: "#fff",
    marginRight: 20,
    marginTop: 10,
    borderRadius: 5,
    padding: 10
  },
  jobStatus: {
    flex: 0.5,
    textAlign: 'left',
  },
  arrowIcon: {
    fontSize: 20,
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
  agendaStyle: {
    borderRadius:30
  }
})

export default ScheduleScreen;