import {
    Alert,
    Platform
} from 'react-native';
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export const CameraImagePicker = async (setImageData) => {

    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission",
          "Please grant camera permission to take photos",
          [{ text: "OK" }]
        );
        return;
      }
    }

    try {
      // const result = await ImagePicker.launchCameraAsync({
      //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
      //   aspect: [4, 3],
      //   quality: 0.8,
      //   base64: true,
      // });

      // if (!result.canceled) {
      //   setImageData(result.assets[0].base64);
      // }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images', // Use 'images' or 'videos'
        aspect: [4, 3],
        quality: 0.3,
        allowsEditing: true, 
        base64: true
      });
    
      if (!result.canceled) {
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1024 } }],
          { compress: 0.3, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        // console.log(result.assets[0].uri); // New way to access the selected file
        setImageData(manipulated.base64);
      }
    } catch (error) {
      console.error("Failed to launch camera:", error);
    }
  };
  

