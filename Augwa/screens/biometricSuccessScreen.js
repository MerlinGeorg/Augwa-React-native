import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  lightText,
  successGreen,
  titleBlack,
} from "../assets/styles/color";
import CustomButton from "../components/CustomButton";
import { scaleSize, moderateScale, calculatePercentageHeight } from "../utils/scaling";

const SuccessScreen = ({ navigation, route }) => {
  const { biometricType } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.iconContainer}>
          <View style={styles.circle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

      
        <Text style={styles.title}>{biometricType} is now set up.</Text>
        <Text style={styles.subtitle}>
          Registration complete!{"\n"}
          You can now log in with {biometricType} or{"\n"}
          your credentials.
        </Text>

       
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Start Using the App"
            onPress={() => navigation.replace("dashboard")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    paddingTop: calculatePercentageHeight(20), 
    alignItems: "center",
    justifyContent: "flex-start",
    flexGrow: 1,
    paddingHorizontal: scaleSize(24),
  },
  iconContainer: {
    marginBottom: scaleSize(24),
  },
  circle: {
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: scaleSize(40),
    backgroundColor: successGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "white",
    fontSize: moderateScale(40),
    fontWeight: "bold",
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    marginBottom: scaleSize(12),
    textAlign: "center",
    color: titleBlack,
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: lightText,
    textAlign: "center",
    lineHeight: scaleSize(22),
    marginBottom: scaleSize(32),
  },
  buttonContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end", 
     marginBottom: scaleSize(32)
  },
});

export default SuccessScreen;
