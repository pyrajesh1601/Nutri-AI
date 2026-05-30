async function runTests() {
  console.log("Starting tests...");
  
  // 1. Register
  console.log("\n--- Testing POST /api/auth/register ---");
  const rand = Math.floor(Math.random() * 10000);
  const email = `testuser${rand}@example.com`;
  
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: email,
      password: 'password123'
    })
  });
  const regData = await regRes.json();
  console.log("Status:", regRes.status);
  console.log("Response:", regData);

  // 2. Login
  console.log("\n--- Testing POST /api/auth/login ---");
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  console.log("Status:", loginRes.status);
  console.log("Response:", loginData);
  
  if (!loginData.token) {
    console.log("Login failed, cannot test /me");
    return;
  }

  // 3. Get Me
  console.log("\n--- Testing GET /api/auth/me ---");
  const meRes = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`
    }
  });
  const meData = await meRes.json();
  console.log("Status:", meRes.status);
  console.log("Response:", meData);
}

runTests();
