import { jest } from '@jest/globals';

describe('test filter tasks only on 2.19', () => {
  
  const today = new Date('2024-02-19');
  
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  
  const filterSchedules = (userTasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return userTasks?.filter((schedule) => {
      const isStatusValid = schedule?.status === "Scheduled" || schedule?.status === "InProgress";
      const startDate = schedule?.startDate ? new Date(schedule.startDate) : null;
      const isDateValid = startDate ? startDate > today : false;
      return isStatusValid && isDateValid;
    }) || [];
  };
  test('return empty array if the input array is empty', () => {
    expect(filterSchedules(null)).toEqual([])
    
  });
  test('filter unfilished tasks', () => {
    const tomorrow = new Date('2024-02-22')

    const tasks = [{
      status: 'Scheduled',
      startDate: today.toISOString()
    },
    {
        status: 'InProgress',
        startDate: today.toISOString()
      },
    {
        status: 'Scheduled',
        startDate: tomorrow.toISOString()
    },
    ];
    const result = filterSchedules(tasks);
    expect(result).toHaveLength(3);
    expect(result[0].status).toBe('Scheduled');
    expect(result[1].status).toBe('InProgress');
    expect(result[2].status).toBe('Scheduled');
  }); 
  test(('filter the past or finished tasks'), () => {
    const yesterday = new Date('2024-02-18')
    const tasks = [
        {
            status: 'Cancelled',
            startDate: today.toISOString()},
        {
            status: 'Finished',
            startDate: yesterday.toISOString()
        }
    ];
    const result = filterSchedules(tasks);
    expect(result).toHaveLength(0);
  })
});