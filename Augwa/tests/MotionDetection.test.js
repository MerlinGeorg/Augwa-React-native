import { renderHook, act } from "@testing-library/react-native";
import { Accelerometer } from "expo-sensors";
import MotionDetection from "../components/MotionDetection";

jest.mock("expo-sensors", () => ({
  Accelerometer: {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    setUpdateInterval: jest.fn(),
  },
}));

describe("MotionDetection Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });

  it("should call onMotionDetected when motion is detected", () => {
    const onMotionDetected = jest.fn();
    let listener;

    Accelerometer.addListener.mockImplementation((callback) => {
      listener = callback;
    });

    renderHook(() => MotionDetection(onMotionDetected));

    act(() => {
      listener({ x: 1, y: 1, z: 1 });
    });

    expect(onMotionDetected).toHaveBeenCalledTimes(1);
  });

  it("should not call onMotionDetected when motion is below threshold", () => {
    const onMotionDetected = jest.fn();
    let listener;

    Accelerometer.addListener.mockImplementation((callback) => {
      listener = callback;
    });

    renderHook(() => MotionDetection(onMotionDetected));

    act(() => {
      listener({ x: 0.1, y: 0.1, z: 0.1 });
    });

    expect(onMotionDetected).not.toHaveBeenCalled();
  });

  it("should remove listener when unmounted", () => {
    const onMotionDetected = jest.fn();

    const { unmount } = renderHook(() => MotionDetection(onMotionDetected));

    unmount();

    // Verify removeAllListeners is called
    expect(Accelerometer.removeAllListeners).toHaveBeenCalledTimes(1);
  });
});
