import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('fetchBookings', () => {
  const mockSetLoading = jest.fn();
  const mockSetSchedule = jest.fn();
  const mockGetBooking = jest.fn();
  const mockConsoleError = jest.fn();

  const mockUser = 'user123';
  const mockAuthToken = 'passedToken';
  const mockBookings = [
    { id: 1, assignedTo: 'user123', title: 'Booking 1' },
    { id: 2, assignedTo: 'other_user', title: 'Booking 2' },
    { id: 3, assignedTo: 'user123', title: 'Booking 3' }
  ];

  const fetchBookings = async () => {
    setLoading(true);
    const result = await getBooking(authToken);
    if (result.success) {
      const assignedBookings = result.data.filter(booking => booking.assignedTo === user);
      setSchedule(assignedBookings);
    } else {
      console.error("Error fetching bookings:", result.error);
    }
    setLoading(false);
  };

  beforeEach(() => {
    
    jest.clearAllMocks();
    
    global.setLoading = mockSetLoading;
    global.setSchedule = mockSetSchedule;
    global.getBooking = mockGetBooking;
    global.console.error = mockConsoleError;
    global.authToken = mockAuthToken;
    global.user = mockUser;
  });

  it('should handle successful booking fetch', async () => {
  
    mockGetBooking.mockResolvedValue({
      success: true,
      data: mockBookings
    });

    await fetchBookings();
    expect(mockSetLoading).toHaveBeenCalledTimes(2);
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true);
    expect(mockSetLoading).toHaveBeenNthCalledWith(2, false);  
    expect(mockGetBooking).toHaveBeenCalledWith(mockAuthToken);    
    expect(mockSetSchedule).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, assignedTo: 'user123' }),
        expect.objectContaining({ id: 3, assignedTo: 'user123' })
      ])
    );
    
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should handle failed booking fetch', async () => {
 
    const errorMessage = 'API Error';
    mockGetBooking.mockResolvedValue({
      success: false,
      error: errorMessage
    });

    await fetchBookings();

    expect(mockSetLoading).toHaveBeenCalledTimes(2);
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true);
    expect(mockSetLoading).toHaveBeenNthCalledWith(2, false);
    
    expect(mockGetBooking).toHaveBeenCalledWith(mockAuthToken);
    
    expect(mockSetSchedule).not.toHaveBeenCalled();
    
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error fetching bookings:",
      errorMessage
    );
  });

  it('should handle API throwing an error', async () => {

    const errorMessage = 'Network Error';
    mockGetBooking.mockRejectedValue(new Error(errorMessage));

    await expect(fetchBookings()).rejects.toThrow(errorMessage);
    
    expect(mockSetLoading).toHaveBeenCalledWith(true);
    expect(mockGetBooking).toHaveBeenCalledWith(mockAuthToken);
    expect(mockSetSchedule).not.toHaveBeenCalled();
  });
});