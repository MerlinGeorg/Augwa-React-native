import React, {useState} from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet,FlatList } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import SearchBar from "../components/SearchBar";
import { getBooking } from "../components/Schedule";
import { augwaBlue,dashboardArea } from "../assets/styles/color";
import { Ionicons } from '@expo/vector-icons';
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

    const tab = createBottomTabNavigator();


return (
    <View style = {[styles.viewStyle]}>
        <View style = {{ backgroundColor: augwaBlue, marginTop:40}}>
            <Text style = {[styles.Title]}>Schedule</Text>
        </View>
        <View style={styles.dashboardAreaStyle}>

        <View style={styles.tabNavigation}>
                    <TouchableOpacity onPress={() => setSelectedTab("Past")}>
                       <Text style={selectedTab === "Past" ? styles.selectedTab : styles.tabText}>Past</Text> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Today")}>
                        <Text style={selectedTab === "Today" ? styles.selectedTab : styles.tabText}>Today</Text> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Future")}>
                        <Text style={selectedTab === "Future" ? styles.selectedTab : styles.tabText}>Future</Text> 
                    </TouchableOpacity>
                </View>

{/* Searcbar and menu options */}
          <View style = {styles.row}>
            <TouchableOpacity>
            <Ionicons name="options-outline" style = {styles.iconStyle}/>
            </TouchableOpacity>
          <SearchBar/>
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
})

export default ScheduleScreen;
