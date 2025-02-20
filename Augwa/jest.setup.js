import 'react-native-gesture-handler/jestSetup';

// Mock expo-modules-core (if necessary, you can add a mock implementation if needed)
jest.mock('expo-modules-core', () => ({
  // You can either return an empty mock, or more specific mocks as required.
  NativeModules: {},
  // Add more mock implementations here if needed.
}));

// Mock other libraries as needed
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};  // No-op to prevent errors during tests.
  return Reanimated;
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/FontAwesome5', () => ({
  default: jest.fn(),
  getImageSource: jest.fn(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => ({
  default: jest.fn(),
  getImageSource: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => ({
  default: jest.fn(),
  getImageSource: jest.fn(),
}));

// Mock local authentication
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
}));

beforeAll(() => {
  // Mock console.error to suppress the output in tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Restore original console.error after all tests
  console.error.mockRestore();
});
