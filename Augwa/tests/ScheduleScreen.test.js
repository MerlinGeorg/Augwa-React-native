import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScheduleScreen from "../screens/ScheduleScreen";
import { getBooking } from "../components/Schedule";
import { AuthContext } from "../src/context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";


jest.mock('@expo/vector-icons', () => ({
    Ionicons: jest.fn(() => null),
}));

jest.mock("../components/Schedule", () => ({
    getBooking: jest.fn(() => Promise.resolve({ success: true, data: [] })), 
}));
  
const mockNavigation = {
    navigate: jest.fn(),
};
  
const mockAuthContext = {
    authToken: "testToken",
    user: "testUser",
};

describe("Schedule Screen", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Formatting date for tab bar
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sample data for testing
    const mockBookings = [
        {
          id: '1',
          address: '123 Main St, City, State',
          startDate: today.toISOString(), // Today
          endDate: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(), // Today
          status: 'scheduled',
          assignedTo: 'testUser',
        },
        {
          id: '2',
          address: '456 Elm St, City, State',
          startDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          endDate: new Date(tomorrow.getTime() + 26 * 60 * 60 * 1000).toISOString(), 
          status: 'scheduled',
          assignedTo: 'testUser',
        },
        {
          id: '3',
          address: '789 Oak St, City, State',
          startDate: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          endDate: new Date(yesterday.getTime() - 22 * 60 * 60 * 1000).toISOString(), 
          status: 'completed',
          assignedTo: 'testUser',
        }
      ];

    const renderComponent = () => {
        return render(
            <AuthContext.Provider value={mockAuthContext}>
        <NavigationContainer>
          <ScheduleScreen navigation={mockNavigation} />
        </NavigationContainer>
      </AuthContext.Provider>
        )
    };

    // Checking if all the fields are rendered correctly
    it('renders ScheduleScreen correctly', async () => {
        const { getByText } = renderComponent();

        expect(getByText('Schedule')).toBeTruthy();
        await waitFor(() => expect(getByText("No jobs found.")).toBeTruthy());
    });

    // Checking loading jobs text rendering state
    it("displays loading message while fetching jobs", () => {
        const { getByText } = renderComponent();
    
        expect(getByText("Loading jobs...")).toBeTruthy();
    });

    // Checking if today's jobs are displayed correctly
    it('filters and displays today jobs correctly', async () => {
    getBooking.mockResolvedValue({ success: true, data: mockBookings });
    
    const { getByText, queryByText } = renderComponent();
    
    await waitFor(() => {
      expect(queryByText("Loading jobs...")).toBeFalsy();
    });

    await waitFor(() => {
        expect(getByText('123 Main St')).toBeTruthy();
        expect(queryByText('456 Elm St')).toBeFalsy();
        expect(queryByText('789 Oak St')).toBeFalsy();
        });
    });


    // Checking if past tab displays past jobs
    it('displays past jobs when Past tab is selected', async () => {
        getBooking.mockResolvedValue({ success: true, data: mockBookings });
    
        const { getAllByText, getByText, queryByText } = renderComponent();
 
        await waitFor(() => {
            expect(queryByText("Loading jobs...")).toBeFalsy();
        });
  
        const yesterdayFormatted = yesterday.toLocaleDateString().split('T')[0];
        const pastTab = getByText(yesterdayFormatted);
        fireEvent.press(pastTab);

        await waitFor(() => {
            const startButtons = getAllByText('START');
            expect(startButtons.length).toBeGreaterThan(0);
        });
    });


    // Checking if future tab displays future jobs
    it('displays future jobs when Future tab is selected', async () => {
        getBooking.mockResolvedValue({ success: true, data: mockBookings });
    
        const { getAllByText, getByText, queryByText } = renderComponent();
    
        await waitFor(() => {
            expect(queryByText("Loading jobs...")).toBeFalsy();
        });
        const tomorrowFormatted = tomorrow.toLocaleDateString().split('T')[0];
        const futureTab = getByText(tomorrowFormatted);
        fireEvent.press(futureTab);
    
        await waitFor(() => {
            const startButtons = getAllByText('START');
            expect(startButtons.length).toBeGreaterThan(0);
        });
    });

    // Testing navigation icon
    it('navigates to job details when chevron is pressed', async () => {
        getBooking.mockResolvedValue({ success: true, data: mockBookings });
    
        const { getByText, getByTestId } = renderComponent();

        await waitFor(() => {
            expect(getByText('123 Main St')).toBeTruthy();
        });

        const chevronButtons = getByTestId('chevron-button-1'); 
        fireEvent.press(chevronButtons);
        expect(mockNavigation.navigate).toHaveBeenCalledWith("schedule_detail", { "jobId": "1" });
    });
  })