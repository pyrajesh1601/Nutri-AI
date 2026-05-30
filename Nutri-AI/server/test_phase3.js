
import { io } from 'socket.io-client';

async function runTests() {
  console.log("Starting Phase 3 tests...");
  
  // 1. Register User 1
  const rand1 = Math.floor(Math.random() * 10000);
  const u1Res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User One', email: `u1${rand1}@example.com`, password: 'password' })
  });
  const u1Data = await u1Res.json();
  const token1 = u1Data.token;

  // 2. Register User 2
  const rand2 = Math.floor(Math.random() * 10000);
  const u2Res = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'User Two', email: `u2${rand2}@example.com`, password: 'password' })
  });
  const u2Data = await u2Res.json();
  const token2 = u2Data.token;

  console.log("Registered 2 users");

  // 3. Setup Socket for User 1
  const socket = io('http://localhost:5000', {
    query: { token: token1 }
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully for User 1');
  });

  socket.on('newNotification', (data) => {
    console.log('\n--- REAL-TIME NOTIFICATION RECEIVED! ---');
    console.log(data);
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // 4. Community Posts
  console.log("\n--- Testing POST /api/community/posts ---");
  const postRes = await fetch('http://localhost:5000/api/community/posts', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}` 
    },
    body: JSON.stringify({ content: "Hello world, this is User 1's post!" })
  });
  const postData = await postRes.json();
  console.log("Create Post Status:", postRes.status, "Post ID:", postData._id);

  console.log("\n--- Testing GET /api/community/posts ---");
  const getPostsRes = await fetch('http://localhost:5000/api/community/posts');
  const getPostsData = await getPostsRes.json();
  console.log("Get Posts Status:", getPostsRes.status, "Total Posts:", getPostsData.length);

  // User 2 likes User 1's post
  console.log("\n--- Testing POST /api/community/posts/:id/like ---");
  const likeRes = await fetch(`http://localhost:5000/api/community/posts/${postData._id}/like`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  console.log("Like Post Status:", likeRes.status);

  // User 2 comments on User 1's post
  console.log("\n--- Testing POST /api/community/posts/:id/comment ---");
  const commentRes = await fetch(`http://localhost:5000/api/community/posts/${postData._id}/comment`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token2}` 
    },
    body: JSON.stringify({ text: "Great post!" })
  });
  console.log("Comment Post Status:", commentRes.status);

  await new Promise(resolve => setTimeout(resolve, 1500)); // wait for socket to deliver

  // 5. Notifications
  console.log("\n--- Testing GET /api/notifications ---");
  const notifRes = await fetch(`http://localhost:5000/api/notifications`, {
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const notifData = await notifRes.json();
  console.log("Get Notifications Status:", notifRes.status, "Count:", notifData.length);
  if (notifData.length > 0) {
    console.log("Marking notification as read...");
    const readRes = await fetch(`http://localhost:5000/api/notifications/${notifData[0]._id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    console.log("Mark Read Status:", readRes.status);
  }

  // 6. AI Chat Coach
  console.log("\n--- Testing POST /api/chat/message ---");
  const chatRes = await fetch(`http://localhost:5000/api/chat/message`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}` 
    },
    body: JSON.stringify({ message: "Hi NutriBot! How are you?" })
  });
  const chatData = await chatRes.json();
  console.log("Chat Message Status:", chatRes.status);
  if (chatRes.status === 200) {
    console.log("Chat Reply:", chatData.message);
  } else {
    console.log("Chat Error:", chatData.message);
  }

  console.log("\n--- Testing GET /api/chat/history ---");
  const chatHistRes = await fetch(`http://localhost:5000/api/chat/history`, {
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  const chatHistData = await chatHistRes.json();
  console.log("Get Chat History Status:", chatHistRes.status, "Count:", chatHistData.length);

  socket.disconnect();
  process.exit(0);
}

runTests();
