import React, { useState, useEffect, useContext } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { TouchableOpacity, Text, View, StyleSheet, FlatList, Modal } from "react-native";
import { getBooking } from "../components/Schedule";
import { augwaBlue, dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';
import { Calendar } from "react-native-calendars";

const ScheduleScreen = ({ navigation }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const { authToken, user, domain } = useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  useEffect(() => {
    console.log("Selected date or schedule changed, filtering jobs...");
    filterJobsByDate(selectedDate);
  }, [selectedDate, schedule]);

 
  const fetchBookings = async () => {
    setLoading(true);

    const result = await getBooking(authToken, domain);

    if (result.success) {
      const assignedBookings = result.data.filter(booking => booking.assignedTo === user);
      setSchedule(assignedBookings);
      filterJobsByDate(selectedDate);
      generateMarkedDates(assignedBookings);
     
    } else {
      console.error("Error fetching bookings:", result.error);
    }

    setLoading(false);
  };

  const filterJobsByDate = (date) => {
    console.log("Filtering jobs for date:", date);
    const filtered = schedule.filter(booking => {
      const jobDate = new Date(booking.startDate).toISOString().split('T')[0];
      console.log("Job date:", jobDate);
      return jobDate === date;
    });
    console.log("Filtered jobs:", filtered);
    setFilteredJobs(filtered);
  };

  const generateMarkedDates = (bookings = schedule) => {
    const marked = {};
    bookings.forEach(booking => {
      const jobDate = new Date(booking.startDate).toISOString().split('T')[0];
      
      if (!marked[jobDate]) {
        marked[jobDate] = { marked: true, dotColor: '#177de1' };
      }
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#177de1',
    };
    
    setMarkedDates(marked);
  };

  const isJobEnabled = (startDate, status) => {
    if (status === 'cancelled' || status === 'completed') return false;

    const now = new Date();
    const jobStart = new Date(startDate);

    return jobStart > now;
  };

 
  const getShortAddress = (address) => {
    return address ? address.split(",")[0] : "";
  };

  
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
      return ` ${formattedStartTime} - ${formattedEndTime}`;
    }
  };

 
  const renderItem = (item) => {
    const enabled = isJobEnabled(item.startDate, item.status);
    
    return (
      <View style={styles.jobCard}>
        <View style={styles.Container}>
        
          <TouchableOpacity 
            style={[styles.startButton, !enabled && styles.startButtonDisabled]}
            disabled={!enabled}
          >
            <Text style={[styles.startButtonText, !enabled && styles.startButtonDisabled]}>
              START
            </Text>
          </TouchableOpacity>

          <View style={styles.jobInfo}>
          
            <View style={styles.JobView}>
              <Ionicons name="location" style={styles.JobIcon} />
              <Text>{getShortAddress(item.address)}</Text>
            </View>

           
            <View style={styles.JobView}>
              <Ionicons name="time-outline" style={styles.JobIcon} />
              <Text>{formatJobTime(item.startDate, item.endDate)}</Text>
            </View>
          </View>
        </View>

       
        <View style={styles.jobStatus}>
          <Text>{item.status === "InProgress" ? "In Progress" : item.status}</Text>
        </View>

        
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

  const formatSelectedDate = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDateSelect = (day) => {
    const selectedDateString = day.dateString;
    console.log("Selected date:", selectedDateString);
    setSelectedDate(selectedDateString);
    filterJobsByDate(selectedDateString);
    setShowCalendar(false);
  };


  return (
    <View style={styles.viewStyle}>
      <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
        <Text style={styles.Title}>Schedule</Text>
      </View>
      <View style={styles.dashboardAreaStyle}>
        <View style={styles.dateSelector}>
          <Text style={styles.selectedDateText}>{formatSelectedDate()}</Text>
          <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarButton}>
            <Ionicons name="calendar" size={24} color="#177de1" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.msgText}>Loading jobs...</Text>
          </View>
        ) : (
          <>
            {filteredJobs.length > 0 ? (
              <FlatList
                data={filteredJobs}
                renderItem={({ item }) => renderItem(item)}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.jobList}
              />
            ) : (
              <View style={styles.emptyDate}>
                <Text style={styles.msgText}>No jobs scheduled for this date.</Text>
              </View>
            )}
          </>
        )}

       
        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                theme={{
                  calendarBackground: '#ffffff',
                  selectedDayBackgroundColor: '#177de1',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#177de1',
                  dayTextColor: '#2d4150',
                  textSectionTitleColor: '#177de1',
                  arrowColor: '#177de1',
                  monthTextColor: '#177de1',
                  dotColor: '#177de1',
                  selectedDotColor: '#ffffff',
                }}
              />
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    padding: 15,
  },
  Title: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
    position: 'relative',
    top: 10
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#177de1',
  },
  calendarButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e6f2ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#fff",
    marginBottom: 10,
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
  jobInfo: {
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
    color: '#999',
  },
  jobList: {
    paddingHorizontal: 5,
  },
  emptyDate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#177de1',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  }
});


export default ScheduleScreen;