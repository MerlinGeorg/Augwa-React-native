import React, {useState} from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet,FlatList } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import SearchBar from "../components/SearchBar";
import { getBooking } from "../components/Schedule";
import { augwaBlue,dashboardArea } from "../assets/styles/color";

const mockJobs = [
  { id: '1', status: 'Scheduled', address: '941 Progress Ave', time: '12/01/2025 10:30 - 10:50' },
  { id: '2', status: 'Scheduled', address: '123 Main St', time: '12/02/2025 11:00 - 11:30' },
  { id: '3', status: 'Scheduled', address: '456 Oak Rd', time: '12/03/2025 14:00 - 14:30' },
  // Add more mock jobs here
];

const JobCard = ({ job }) => {
    return (
        <View style={styles.card}>
            <View style = {styles.row}>
      <Text style={styles.status}>🔵 {job.status}</Text>
      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.buttonText}>START</Text>
      </TouchableOpacity>
      </View>
      <Text style={styles.address}>{job.address}</Text>
      <Text style={styles.time}>{job.time}</Text>
    </View>
    )
}



const ScheduleScreen = (props) => {
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filtersearch, setFilterSearch] = useState([])


return (
    <View style = {[styles.viewStyle]}>
        <View style = {{ backgroundColor: augwaBlue, marginTop:40}}>
            <Text style = {[styles.Title]}>Schedule</Text>
        </View>
        {/* Schedule area */}
        <View style={styles.dashboardAreaStyle}>
        <SearchBar/>
        <Text style ={[styles.Content]}>Today's Schedule</Text>
        <FlatList
        data={mockJobs}
        renderItem={({ item }) => <JobCard job={item} />}
          keyExtractor={(item) => item.id}

        />
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
        fontWeight: 'bold',
        color: '#000'
      },
      card: {
        backgroundColor: '#fff',
        padding: 15,
        margin: 10,
        borderRadius: 10,
   // shadowColor: '#000',
   // shadowOffset: { width: 0, height: 2 },
   // shadowOpacity: 0.1,
    //shadowRadius: 4,
      elevation: 2,
      },
      status: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#177de1', // Blue color for status
      },
      address: {
        marginTop: 5,
        color: '#000',
      },
      time: {
        fontSize: 14,
        marginTop: 5,
        color: '#888',
      },
      startButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#177de1', // Blue background
        borderRadius: 5,
        alignItems: 'center',
      },
      buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }
})

export default ScheduleScreen;
