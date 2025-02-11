import React, {useState} from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet } from "react-native";
import { ScrollView } from 'react-native-gesture-handler';
import SearchBar from "../components/SearchBar";

const ScheduleScreen = (props) => {
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filtersearch, setFilterSearch] = useState([])
}
