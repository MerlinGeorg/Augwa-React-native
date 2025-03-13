import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

const THRESHOLD = 1.0;

const MotionDetection = (onMotionDetected) => {
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const handleMotion = (data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > THRESHOLD) {
        onMotionDetected();
      }
    };

    // Add listener
    Accelerometer.setUpdateInterval(1000);
    subscriptionRef.current = Accelerometer.addListener(handleMotion);

    return () => {
      // Remove the listener
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [onMotionDetected]);

  return null;
};

export default MotionDetection;
