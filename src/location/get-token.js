import fetch from 'node-fetch';

async function getToken() {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testdriver@example.com',    // Our test driver email
        password: 'Test123!@#'              // Our test driver password
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Your JWT token:', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

getToken(); 