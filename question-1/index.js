require('dotenv').config();
const express = require('express');
const axios = require('axios');

const server = express();
const port = 4000;
const API_BASE = 'http://20.244.56.144/evaluation-service';

server.use(express.json());

const TOKEN = process.env.TOKEN;
const headers = {
  Authorization: `Bearer ${TOKEN}`,
};

async function getUsersData() {
  try {
    const res = await axios.get(`${API_BASE}/users`, { headers });
    return res.data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    return [];
  }
}

async function getUserPosts(userId) {
  try {
    const res = await axios.get(`${API_BASE}/users/${userId}/posts`, { headers });
    return res.data.posts || [];
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error.response?.data || error.message);
    return [];
  }
}

async function getCommentsForPost(postId) {
  try {
    const res = await axios.get(`${API_BASE}/posts/${postId}/comments`, { headers });
    return res.data.comments || [];
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error.response?.data || error.message);
    return [];
  }
}

server.get('/test', async (req, res) => {
  try {
    const allUsers = await getUsersData();
    res.json({ topUsers: allUsers });
  } catch (err) {
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

server.get('/posts', async (req, res) => {
  try {
    const { type } = req.query;
    if (!type || (type !== 'latest' && type !== 'popular')) {
      return res.status(400).json({ error: 'Invalid query parameter. Accepted values: latest, popular' });
    }
    const usersData = await getUsersData();
    const postsFromUsers = await Promise.all(
      Object.keys(usersData).map(async (userId) => {
        const userPosts = await getUserPosts(userId);
        return userPosts.map(post => ({ ...post, username: usersData[userId] }));
      })
    );
    const allPosts = postsFromUsers.flat();

    if (type === 'latest') {
      const sortedPosts = allPosts.sort((a, b) => b.id - a.id);
      return res.json({ posts: sortedPosts.slice(0, 5) });
    } else if (type === 'popular') {
      const postsWithComments = await Promise.all(
        allPosts.map(async (post) => {
          try {
            const comments = await getCommentsForPost(post.id);
            return { ...post, commentsCount: comments.length };
          } catch (err) {
            console.error(`Failed to fetch comments for post ${post.id}:`, err.response?.data || err.message);
            return { ...post, commentsCount: 0 };
          }
        })
      );
      const highest = postsWithComments.length ? Math.max(...postsWithComments.map(p => p.commentsCount)) : 0;
      const topPopular = postsWithComments.filter(p => p.commentsCount === highest);
      return res.json({ posts: topPopular });
    }
  } catch (error) {
    console.error('Error processing GET /posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

server.listen(port, () => {
  console.log(`Server up at http://localhost:${port}`);
});
