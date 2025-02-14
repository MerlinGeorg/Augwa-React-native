import React, {useState, useEffect, useContext} from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet,FlatList } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import SearchBar from "../components/SearchBar";
import { getBooking } from "../components/Schedule";
import { augwaBlue,dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';


const ScheduleScreen = (props) => {
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filtersearch, setFilterSearch] = useState([])
    const [selectedTab, setSelectedTab] = useState("Today");
    const { authToken, user } = useContext(AuthContext);

    // Get dates for tabs
    const getDates = () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return {
          Past: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          Today: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          Future: tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
        console.log("Fetched bookings:", result.data);
        const assignedBookings = result.data.filter(booking => booking.assignedTo === user);
        console.log("Assigned bookings:", JSON.stringify(assignedBookings, null, 2));
        setSchedule(assignedBookings);
       

      } else {
          console.error("Error fetching bookings:", result.error);
      }
      setLoading(false);
  };

  // Function to load the selectedTab jobs
  const filterJobs = () => {
    const today = new Date().toISOString().split("T")[0];
    //const todayDate = new Date(today.toDateString());

    return schedule.filter((job) => {
      console.log("Job Date (before conversion):", job.startDate);
      const jobDate = new Date(job.startDate).toISOString().split("T")[0];
        console.log("Converted Job Date:", jobDate);

        //const jobDateOnly = new Date(jobDate.toDateString());

        if (selectedTab === "Today") {
          return jobDate == today; // Compare date without time
        } else if (selectedTab === "Past") {
          return jobDate < today; // Compare against today's date
        } else if (selectedTab === "Future") {
          return jobDate > today; // Compare against today's date
        }

        return false; 
    });
};  


console.log("Filtered Jobs:", filterJobs());
const dates = getDates();

const handleStatusUpdate = async (bookingId, newStatus) => {
  try {
      const result = await updateJobStatus(authToken, bookingId, newStatus);
      if (result.success) {
          setSchedule(prevSchedule => 
              prevSchedule.map(job => 
                  job.id === bookingId ? { ...job, status: newStatus } : job
              )
          );
      }
  } catch (error) {
      console.error("Error updating status:", error);
  }
};

const isJobEnabled = (startDate, status) => {
  if (status === 'cancelled' || status === 'completed') return false;
  const now = new Date();
  const jobStart = new Date(startDate);
  return jobStart > now;
};



return (
    <View style = {[styles.viewStyle]}>
        <View style = {{ backgroundColor: augwaBlue, marginTop:40}}>
            <Text style = {[styles.Title]}>Schedule</Text>
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
                    <View style = { styles.Container}>
                      
                    {loading ? (
                        <Text style={ styles.msgText }>Loading jobs...</Text>
                ) : schedule.length > 0 ? (
                  <FlatList 
                 data={filterJobs()}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => {
                    const formattedStartTime = new Date(item.startDate).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit", hour12: true});
                    const formattedEndTime = new Date(item.endDate).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit", hour12: true });

                    const enabled = isJobEnabled(item.startDate, item.status);

                    return (
                      <TouchableOpacity onPress={() => console.log('Job selected:', item)}>
                          <View style={styles.jobCard}>
                              <View style = {styles.Container}>

                              <TouchableOpacity style={[styles.startButton, !enabled && styles.startButtonDisabled]}
                                  disabled={!enabled}
                                  onPress={() => handleStatusUpdate(item.id, 'in_progress')}>
                                <Text style={[styles.startButtonText,
                                                    !enabled && styles.startButtonTextDisabled]}>START</Text>
                              </TouchableOpacity>
                             
                              <View style={styles.jobInfo}>
                                  <View style= {styles.JobView}>
                                    <Ionicons name="location" style={styles.JobIcon}/>
                                    <Text> {item.address}</Text>
                                  </View>
                                  <View style = {styles.JobView}>
                                    <Ionicons name="time-outline" style = {styles.JobIcon} />
                                    <Text> {formattedStartTime} - {formattedEndTime}</Text>
                                  </View>
                              </View>
                              </View>
                              <Text> {item.status}</Text>
                          </View>
                      </TouchableOpacity>
                  )}}
              />
              
                        ) : (
                            <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
                                No jobs found.
                            </Text>
                        )}
                        </View>
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
        paddingHorizontal: 15,
       
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
    color: '#666'
  },
  
  startButton: {
    backgroundColor: '#177de1',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'flex-start',
},
startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
