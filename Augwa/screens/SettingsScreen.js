import React from "react";
import { TouchableOpacity, Text, Button, View, StyleSheet } from "react-native";
import { augwaBlue, dashboardArea } from "../assets/styles/color";

const SettingsScreen = ({navigation }) => {
    return (
        <View style={styles.viewStyle}>
          <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
            <Text style={styles.Title}>Schedule</Text>
          </View>
          </View>
)}

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
})

export default SettingsScreen;