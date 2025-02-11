import React, {useState} from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet,FlatList } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import SearchBar from "../components/SearchBar";
import { getBooking } from "../components/Schedule";
import { augwaBlue,dashboardArea } from "../assets/styles/color";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';



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
          <View style = {styles.row}>
          <FontAwesome6 name="sliders" />
          <SearchBar/>
          </View>
        <Text style ={[styles.Content]}>Today's Schedule</Text>
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
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
})

export default ScheduleScreen;
