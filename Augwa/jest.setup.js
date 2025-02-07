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

beforeAll(() => {
  // Mock console.error to suppress the output in tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Restore original console.error after all tests
  console.error.mockRestore();
});
