const express = require('express')
const axios = require('axios')
const server = express()
const port = 4000
const API_BASE = 'http://20.244.56.144/evaluation-service'
server.use(express.json())


const headers = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA0NzYxLCJpYXQiOjE3NDM2MDQ0NjEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjUzNmYxYmY0LTk1NzktNDUyZi04YzMzLTBjYmY1MDI1N2Y1MiIsInN1YiI6IjIyMDYzMDlAa2lpdC5hYy5pbiJ9LCJlbWFpbCI6IjIyMDYzMDlAa2lpdC5hYy5pbiIsIm5hbWUiOiJ1dGthcnNoIGpoYSIsInJvbGxObyI6IjIyMDYzMDkiLCJhY2Nlc3NDb2RlIjoibndwd3JaIiwiY2xpZW50SUQiOiI1MzZmMWJmNC05NTc5LTQ1MmYtOGMzMy0wY2JmNTAyNTdmNTIiLCJjbGllbnRTZWNyZXQiOiJZSFBkU1ZTWWpSc2FHbXZSIn0.b65jC7pkdrBjNRkvYwD1Cyz0thC8ZD_1fipYv5l04Dw`
  };

  async function getUsersData() {
    try {
        const res = await axios.get(`${API_BASE}/users`, { headers });
        console.log('API Response:', res.data); // Log full response
        return res.data.users || []; // Ensure users exist before returning
    } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
        return [];
    }
}


async function getUserPosts(userId) {
  const res = await axios.get(`${API_BASE}/users/${userId}/posts`, { headers })
  return res.data.posts || []
}

async function getCommentsForPost(postId) {
  const res = await axios.get(`${API_BASE}/posts/${postId}/comments`, { headers })
  return res.data.comments || []
}



server.get('/test', async (req, res) => {
  try {
    const allUsers = await getUsersData()
    console.log('All users:', allUsers)
    res.json({ topUsers: allUsers })
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
server.get('/users', async (req, res) => {
  try {
    const allUsers = await getUsersData();
    const userDetails = await Promise.all(
      Object.entries(allUsers).map(async ([uid, uname]) => {
        const userPosts = await getUserPosts(uid);
        return { userId: uid, username: uname, postsTotal: userPosts.length };
      })
    );
    userDetails.sort((a, b) => b.postsTotal - a.postsTotal);
    const bestFiveUsers = userDetails.slice(0, 5);
    res.json({ topUsers: bestFiveUsers });
  } catch (err) {
    console.error('Error retrieving users analytics:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

server.get('/users', async (req, res) => {
  try {
    const allUsers = await getUsersData();
    const userDetails = await Promise.all(
      Object.entries(allUsers).map(async ([uid, uname]) => {
        const userPosts = await getUserPosts(uid);
        return { userId: uid, username: uname, postsTotal: userPosts.length };
      })
    );
    userDetails.sort((a, b) => b.postsTotal - a.postsTotal);
    const bestFiveUsers = userDetails.slice(0, 5);
    res.json({ topUsers: bestFiveUsers });
  } catch (err) {
    console.error('Error retrieving users analytics:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


server.listen(port, () => {
  console.log(`Server up at http://localhost:${port}`)
})
