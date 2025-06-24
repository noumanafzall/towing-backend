import fetch from 'node-fetch';

// Function to generate points along a route
function interpolatePoints(start, end, numPoints) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    points.push({
      lat: start.lat + (end.lat - start.lat) * fraction,
      lng: start.lng + (end.lng - start.lng) * fraction
    });
  }
  return points;
}

async function simulateDriverMovement(rideId, startPoint, endPoint) {
  const points = interpolatePoints(startPoint, endPoint, 10);
  let progress = 0;
  
  console.log('Starting location simulation...');
  
  for (const point of points) {
    try {
      progress += 10;
      const response = await fetch(`http://localhost:3000/location/update/${rideId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJyb2xlIjoiRFJJVkVSIiwiaWF0IjoxNzUwMzQ1MTM2LCJleHAiOjE3NTAzNDg3MzZ9.1Olqyny_3j6qxvdSGVLs6kR_XmyX-hWaWBCLJ5mdjbI'
        },
        body: JSON.stringify({
          latitude: point.lat,
          longitude: point.lng,
          speed: 60, // Example speed in km/h
          heading: 90, // Example heading in degrees
          accuracy: 10 // Example accuracy in meters
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log(`Updated location: ${JSON.stringify(point)}, Progress: ${progress}%`);
      
      // Wait for 3 seconds before next update
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }
  
  console.log('Location simulation completed');
}

// Example usage:
const rideId = process.argv[2]; // Get ride ID from command line argument
if (!rideId) {
  console.error('Please provide a ride ID as an argument');
  process.exit(1);
}

// Example route from NYC to Newark
const startPoint = { lat: 40.7128, lng: -74.0060 }; // NYC
const endPoint = { lat: 40.7357, lng: -74.1724 };   // Newark

simulateDriverMovement(rideId, startPoint, endPoint); 