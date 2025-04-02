'use client';

import { useEffect, useState } from 'react';

interface User {
  userId: string;
  username: string;
  postsTotal: number;
}

interface Post {
  id: number;
  content: string;
  username: string;
  commentsCount?: number;
}

export default function Home() {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/users')
      .then(res => res.json())
      .then(data => setTopUsers(data.topUsers))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/posts?type=popular')
      .then(res => res.json())
      .then(data => setTrendingPosts(data.posts))
      .catch(err => console.error('Error fetching trending posts:', err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/posts?type=latest')
      .then(res => res.json())
      .then(data => setFeed(data.posts))
      .catch(err => console.error('Error fetching feed:', err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Top Users</h1>
      <ul>
        {topUsers.map(user => (
          <li key={user.userId}>{user.username} - {user.postsTotal} posts</li>
        ))}
      </ul>

      <h1 className="text-2xl font-bold mt-4">Trending Posts</h1>
      <ul>
        {trendingPosts.map(post => (
          <li key={post.id}>{post.content} - {post.commentsCount} comments</li>
        ))}
      </ul>

      <h1 className="text-2xl font-bold mt-4">Feed</h1>
      <ul>
        {feed.map(post => (
          <li key={post.id}>{post.content} - by {post.username}</li>
        ))}
      </ul>
    </div>
  );
}