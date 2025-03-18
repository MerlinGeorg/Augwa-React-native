import React from "react";
import {View, Text, StyleSheet, SafeAreaView} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { augwaBlue, dashboardArea } from "../assets/styles/color";

const ProfileScreen = () => {
    return (
        <SafeAreaView style={styles.viewStyle}>
            <View style={{ backgroundColor: augwaBlue, marginTop: 40 }}>
                <Text style={styles.Title}>Settings</Text>
            </View>
            <View style={styles.dashboardAreaStyle}>
                <View style = {styles.iconStyle}>
                <FontAwesome name="user-circle" style={styles.Icon} />
                </View>
            </View>
        </SafeAreaView>
    );
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
iconStyle: {
    alignSelf: 'center',
    marginTop: 20
},
Icon: {
    fontSize: 70

}
});

export default ProfileScreen;