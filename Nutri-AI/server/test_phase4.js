async function runTests() {
  console.log("Starting Phase 4 tests...");
  
  // 1. Login as Admin
  const adminRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `admin@nutriai.com`, password: 'Admin@1234' })
  });
  const adminData = await adminRes.json();
  const token = adminData.token;
  console.log("Admin login status:", adminRes.status);

  // 2. Fetch Stats
  const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const statsData = await statsRes.json();
  console.log("Get Stats Status:", statsRes.status);
  console.log("Stats:", statsData);

  // 3. Get Users
  const usersRes = await fetch('http://localhost:5000/api/admin/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  console.log("Get Users Status:", usersRes.status, "Count:", usersData.length);

  // 4. Delete a regular user (if exists)
  const regularUser = usersData.find(u => u.role !== 'admin');
  if (regularUser) {
    console.log(`Found regular user to delete: ${regularUser.email}`);
    const delUserRes = await fetch(`http://localhost:5000/api/admin/users/${regularUser._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Delete User Status:", delUserRes.status);
  }

  // 5. Get Posts
  const postsRes = await fetch('http://localhost:5000/api/admin/posts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const postsData = await postsRes.json();
  console.log("Get Posts Status:", postsRes.status, "Count:", postsData.length);

  // 6. Delete Post
  if (postsData.length > 0) {
    const delPostRes = await fetch(`http://localhost:5000/api/admin/posts/${postsData[0]._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Delete Post Status:", delPostRes.status);
  }

  process.exit(0);
}

runTests();
