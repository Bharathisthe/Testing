import { test, expect, request } from '@playwright/test';

test('Login API: should return 200 and a valid token on success', async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.post('https://ball-machine.waltair.io/api/users/login', {
    data: {
      username: 'nick.bollettier6@example.com',
      passcode: 'ServeAce2022'
    }
  });

  // Check status code
  expect(response.status()).toBe(200);

  const body = await response.json();

  // Log the body if needed
  console.log('Response Body:', body);

  const cookies = await apiContext.storageState();

  console.log('Cookies:', cookies.cookies);


});

test('Login API: should return 401 on a failure', async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.post('https://ball-machine.waltair.io/api/users/login', {
    data: {
      username: 'fake.email@example.com',
      passcode: '123'
    }
  });

  // Check status code
  expect(response.status()).toBe(401);

});

test('Login API: should return 400 on a failure with empty string and random spaces', async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.post('https://ball-machine.waltair.io/api/users/login', {
    data: {
      username: '',
      passcode: '123'
    }
  });

  // Check status code
  expect(response.status()).toBe(400);


  const response1 = await apiContext.post('https://ball-machine.waltair.io/api/users/login', {
    data: {
      "username": "nick. bollettier6@example.com",
      "passcode": "ServeAce2022"
  }
  
  });

  expect(response1.status()).toBe(400);

});




test('Login and Logout using AUTH-SEC-TOKEN from response header', async () => {
  const apiContext = await request.newContext();

  // Step 1: Login and extract token from response header
  const loginResponse = await apiContext.post('https://ball-machine.waltair.io/api/users/login', {
    data: {
      username: 'nick.bollettier6@example.com',
      passcode: 'ServeAce2022'
    }
  });

  expect(loginResponse.status()).toBe(200);

  // Extract the token from response headers
  const headers = loginResponse.headers();
  const authToken = headers['auth-sec-token']; // Header keys are lowercase in Playwright

  expect(authToken).toBeTruthy();
  console.log('Auth Token:', authToken);

  // Step 2: Logout using the token in the header
  const logoutResponse = await apiContext.post('https://ball-machine.waltair.io/api/users/logout', {
    headers: {
      'AUTH-SEC-TOKEN': authToken 
    }
  });

  expect(logoutResponse.status()).toBe(200);
  const logoutBody = await logoutResponse.json();
  console.log('Logout Response:', logoutBody);
});

test('Unsuccessful logout should return an error when no token is provided', async () => {
  const apiContext = await request.newContext();

  // Send logout request without any auth token
  const response = await apiContext.post('https://ball-machine.waltair.io/api/users/logout');

  // Expect an error: unauthorized or session invalid
  expect(response.status()).toBeGreaterThanOrEqual(400); // e.g., 401 or 403
  const body = await response.json();

  console.log('Logout Response:', body);

  
  expect(body.message.toLowerCase()).toMatch(/invalid|expired|unauthorized|missing/);
});


test('Unsuccessful logout with invalid token should fail', async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.post('https://ball-machine.waltair.io/api/users/logout', {
    headers: {
      'AUTH-SEC-TOKEN': '1u$u2ufh3u2829@inavlid'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(400); // Should not succeed
  const body = await response.json();

  console.log('Logout Response with invalid token:', body);
  expect(body.message.toLowerCase()).toMatch(/invalid|expired|unauthorized/);
});


test('GET /api/users/dashboard - success with valid token', async () => {
  const apiContext = await request.newContext();

  // Login to get token
  const loginRes = await apiContext.post('https://ball-machine.waltair.io/api/users/login', {
    data: {
      username: 'nick.bollettier6@example.com',
      passcode: 'ServeAce2022'
    }
  });

  const authToken = loginRes.headers()['auth-sec-token'];
  expect(authToken).toBeTruthy();

  // Access dashboard with valid token
  const dashRes = await apiContext.get('https://ball-machine.waltair.io/api/users/dashboard', {
    headers: {
      'AUTH-SEC-TOKEN': authToken
    }
  });

  expect(dashRes.status()).toBe(200);

  const data = await dashRes.json();
  console.log('Dashboard data:', data);

});

test('GET /api/users/dashboard - should fail without token', async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.get('https://ball-machine.waltair.io/api/users/dashboard');

  expect(response.status()).toBeGreaterThanOrEqual(401);
  const body = await response.json();

  expect(body.message.toLowerCase()).toMatch(/unauthorized|invalid|expired/);
});


test('GET /api/users/dashboard - should fail with invalid token', async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.get('https://ball-machine.waltair.io/api/users/dashboard', {
    headers: {
      'AUTH-SEC-TOKEN': 'invalid_token_123'
    }
  });

  expect(response.status()).toBeGreaterThanOrEqual(401);
  const body = await response.json();

  expect(body.message.toLowerCase()).toMatch(/unauthorized|invalid|expired/);
});




