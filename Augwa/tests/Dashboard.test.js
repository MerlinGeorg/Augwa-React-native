import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { AuthContext } from '../src/context/AuthContext';
import DashboardScreen from '../screens/DashboardScreen';
import axios from 'axios';
import base64 from 'base-64';

jest.mock('axios');
jest.mock('base-64');
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('../components/Message', () => 'Message');
jest.mock('../components/BellIcon', () => 'BellIcon');
jest.mock('../components/FetchList');

const mockNavigation = {
  navigate: jest.fn(),
};

const mockRoute = {};

const mockAuthContext = {
  authToken: 'mock-token',
  userName: 'Tester',
};

const mockScheduleData = [
  {
    id: '1',
    status: 'Scheduled',
    address: '123 Test St',
    startDate: '2025-02-20T10:00:00',
    assignedStaff: [
      {
        staff: {
          id: 'staff_id'
        }
      }
    ]
  },
  {
    id: '2',
    status: 'InProgress',
    address: '456 Test Ave',
    startDate: '2025-02-20T14:00:00',
    assignedStaff: [
      {
        staff: {
          id: 'staff_id'
        }
      }
    ]
  },
  {
    id: '3',
    status: 'Scheduled',
    address: '123 Test Ave',
    startDate: '2025-02-21T13:00:00',
    assignedStaff: [
      {
        staff: {
          id: 'staff_id'
        }
      }
    ]
  }
];

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    base64.decode.mockImplementation(() => JSON.stringify({ StaffId: 'staff_id' }));
  });

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <DashboardScreen navigation={mockNavigation} route={mockRoute} />
      </AuthContext.Provider>
    );
  };

  it('renders welcome message with username', () => {
    const { getByText } = renderComponent();
    expect(getByText('Welcome,')).toBeTruthy();
    expect(getByText(' Tester !')).toBeTruthy();
  });

  it('renders section title', () => {
    const { getByText } = renderComponent();
    expect(getByText('Performance Overview')).toBeTruthy();
  });

  it('displays no task message when there are no tasks', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(getByText('No task today!')).toBeTruthy();
    });
  });
  it('navigates to schedule screen when "View all" is pressed', () => {
    const { getByText } = renderComponent();
    const viewAllButton = getByText('View all');
    fireEvent.press(viewAllButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('schedule');
  });

  it('displays correct performance metrics', async () => {
    const { getByText } = renderComponent();
    await waitFor(() => {
      expect(getByText("Today's tasks left:")).toBeTruthy();
      expect(getByText('Weekly tasks:\n')).toBeTruthy();
    });
  });

});