const express = require('express')
const axios = require('axios')
const server = express()
const port = 4000
const API_BASE = 'http://20.244.56.144/evaluation-service'
server.use(express.json())

async function getUsersData() {
  const res = await axios.get(`${API_BASE}/users`)
  return res.data.users
}

async function getUserPosts(userId) {
  const res = await axios.get(`${API_BASE}/users/${userId}/posts`)
  return res.data.posts || []
}

async function getCommentsForPost(postId) {
  const res = await axios.get(`${API_BASE}/posts/${postId}/comments`)
  return res.data.comments || []
}

server.listen(port, () => {
  console.log(`Server up at http://localhost:${port}`)
})
