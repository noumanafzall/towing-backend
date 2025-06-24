import fetch from 'node-fetch';

async function createTestRide() {
  try {
    const response = await fetch('http://localhost:3000/rides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJyb2xlIjoiRFJJVkVSIiwiaWF0IjoxNzUwMzQ0OTI5LCJleHAiOjE3NTAzNDg1Mjl9.FzTGsWyJ_9M6nBMPvFjc1_vmTik_2Rak14WPCgKcUX0'
      },
      body: JSON.stringify({
        driverId: 10, // Our test driver ID
        customerId: 1, // Replace with a valid customer ID
        pickupLocation: '40.7128,-74.0060', // NYC coordinates
        pickupDateTime: new Date().toISOString(),
        dropoffLocation: '40.7357,-74.1724', // Newark coordinates
        dropoffDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        status: 'ONGOING',
        distance: 10,
        basePrice: 100,
        extraMiles: 0,
        totalCost: 100
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${error}`);
    }

    const data = await response.json();
    console.log('Ride created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating ride:', error);
    return null;
  }
}

createTestRide(); 