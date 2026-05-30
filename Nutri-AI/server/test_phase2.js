async function runTests() {
  console.log("Starting Phase 2 tests...");
  
  // 1. Register/Login
  const rand = Math.floor(Math.random() * 10000);
  const email = `testuser${rand}@example.com`;
  
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User 2',
      email: email,
      password: 'password123'
    })
  });
  const regData = await regRes.json();
  const token = regData.token;
  console.log("Registered user, got token");

  // 2. Create Health Profile
  console.log("\n--- Creating Health Profile ---");
  const hpRes = await fetch('http://localhost:5000/api/health/profile', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      age: 30,
      gender: 'female',
      weight: 65,
      height: 165,
      activityLevel: 'moderately active',
      goal: 'lose',
      dailyBudget: 500
    })
  });
  const hpData = await hpRes.json();
  console.log("Health Profile Created:", hpRes.status);

  // 3. Test Diet Routes
  console.log("\n--- Testing POST /api/diet/meal-plan/generate ---");
  const genDietRes = await fetch('http://localhost:5000/api/diet/meal-plan/generate', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({}) // Use profile budget
  });
  const genDietData = await genDietRes.json();
  console.log("Generated Meal Plan Status:", genDietRes.status);
  if(genDietRes.status !== 201) {
    console.error(genDietData);
  } else {
    console.log("Generated Meal Plan Cost:", genDietData.totalCost);
  }

  console.log("\n--- Testing GET /api/diet/meal-plan ---");
  const getDietRes = await fetch('http://localhost:5000/api/diet/meal-plan', {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  const getDietData = await getDietRes.json();
  console.log("Get Today Meal Plan Status:", getDietRes.status);

  console.log("\n--- Testing GET /api/diet/log ---");
  const getDietLogRes = await fetch('http://localhost:5000/api/diet/log', {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  const getDietLogData = await getDietLogRes.json();
  console.log("Get Diet Log History Status:", getDietLogRes.status, "Count:", getDietLogData.length);

  // 4. Test Exercise Routes
  console.log("\n--- Testing GET /api/exercises ---");
  const getExRes = await fetch('http://localhost:5000/api/exercises', {
    method: 'GET',
  });
  const getExData = await getExRes.json();
  console.log("Get All Exercises Status:", getExRes.status, "Count:", getExData.length);
  
  if (getExData.length === 0) {
    console.error("No exercises found!");
    return;
  }
  const exerciseId = getExData[0]._id;

  console.log("\n--- Testing GET /api/exercises/:id ---");
  const getOneExRes = await fetch(`http://localhost:5000/api/exercises/${exerciseId}`, {
    method: 'GET',
  });
  const getOneExData = await getOneExRes.json();
  console.log("Get One Exercise Status:", getOneExRes.status, "Name:", getOneExData.name);

  console.log("\n--- Testing POST /api/exercises/log ---");
  const logExRes = await fetch(`http://localhost:5000/api/exercises/log`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      exerciseId: exerciseId,
      duration: 30,
      caloriesBurned: 250,
      notes: 'Felt great!'
    })
  });
  const logExData = await logExRes.json();
  console.log("Log Workout Status:", logExRes.status, "Logged Id:", logExData._id);

  console.log("\n--- Testing GET /api/exercises/log/history ---");
  const getExHistRes = await fetch(`http://localhost:5000/api/exercises/log/history`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  const getExHistData = await getExHistRes.json();
  console.log("Get Workout History Status:", getExHistRes.status, "Count:", getExHistData.length);
  
  process.exit(0);
}

runTests();
