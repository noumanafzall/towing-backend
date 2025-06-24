import fetch from 'node-fetch';

async function registerTestDriver() {
  try {
    const response = await fetch('http://localhost:3000/auth/register/driver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test.driver@example.com',
        password: 'password123',
        fullName: 'Test Driver',
        phoneNumber: '1234567890',
        country: 'United States',
        city: 'New York',
        languages: ['English'],
        termsAccepted: true,
        experience: 2
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Error registering driver:', error);
    return null;
  }
}

registerTestDriver(); 