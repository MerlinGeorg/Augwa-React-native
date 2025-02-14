import React, {useState, useEffect, useContext} from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet,FlatList } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import SearchBar from "../components/SearchBar";
import { getBooking } from "../components/Schedule";
import { augwaBlue,dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../src/context/AuthContext';

/*const Tabbar = ({ tabName }) => {
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
};}
*/


const ScheduleScreen = (props) => {
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filtersearch, setFilterSearch] = useState([])
    const [selectedTab, setSelectedTab] = useState("Today");
    const { authToken, user } = useContext(AuthContext);


    useEffect(() => {
      fetchBookings();
  }, []);

  useEffect(() => {
    //console.log("Updated Schedule State:", JSON.stringify(schedule, null, 2));
}, [schedule]);

    // Function to fetch booking
    const fetchBookings = async () => {
      setLoading(true);
      const result = await getBooking(authToken);
      if (result.success) {
        console.log("Fetched bookings:", result.data);
        const assignedBookings = result.data.filter(booking => booking.assignedTo === user);
        console.log("Assigned bookings:", JSON.stringify(assignedBookings, null, 2));
        setSchedule(assignedBookings);
       // console.log("Schedule State:", JSON.stringify(schedule, null, 2));

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
                    <View style = {{ flex: 1}}>
                      
                    {loading ? (
                        <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
                        Loading jobs...
                    </Text>
                ) : schedule.length > 0 ? (
                  
                  <FlatList
                 data={filterJobs()}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => console.log('Job selected:', item)}>
                          <View style={styles.jobCard}>
                              <View>
                                  <Button title="START" style={styles.buttonstyle}>
                                  </Button>
                                  <Text>Location: {item.address}</Text>
                                  <Text>Time: {item.time}</Text>
                
                              </View>
                          </View>
                      </TouchableOpacity>
                  )}
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
      alignItems: 'stretch',
      justifyContent:'space-between',
      backgroundColor: "lightgrey",
      marginLeft: 20,
      marginRight: 20,
      marginTop: 10,
      borderRadius: 5,
      padding: 10
  },
  buttonstyle: {
   
    justifyContent: 'space-between',
    flexDirection: 'row'

  }
})

export default ScheduleScreen;
