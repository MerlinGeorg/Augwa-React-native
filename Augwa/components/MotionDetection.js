import { useEffect } from "react";
import { Accelerometer } from "expo-sensors";

const THRESHOLD = 1.0;

const MotionDetection = (onMotionDetected) => {
  useEffect(() => {
    const handleMotion = (data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > THRESHOLD) {
        onMotionDetected();
      }
    };

    Accelerometer.addListener(handleMotion);
    Accelerometer.setUpdateInterval(1000);

    return () => {
      Accelerometer.removeAllListeners();
    };
  }, [onMotionDetected]);
};

export default MotionDetection;
