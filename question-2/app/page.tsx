"use client";

import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:4000/users")
        .then((res) => res.json())
        .then((data) => setTopUsers(data.topUsers)),

      fetch("http://localhost:4000/posts?type=popular")
        .then((res) => res.json())
        .then((data) => setTrendingPosts(data.posts)),

      fetch("http://localhost:4000/posts?type=latest")
        .then((res) => res.json())
        .then((data) => setFeed(data.posts)),
    ])
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <section>
        <h1 className="text-3xl font-bold mb-4">Top Users</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(5)
                .fill(null)
                .map((_, index) => (
                  <div key={`user-loading-${index}`} className="h-24 bg-gray-700 animate-pulse rounded-md"></div>
                ))
            : topUsers.map((user, index) => (
                <div key={`${user.userId}-${index}`} className="p-4 border border-gray-700 rounded-lg shadow-md bg-gray-800">
                  <h2 className="text-lg font-semibold">{user.username}</h2>
                  <p className="text-gray-400">{user.postsTotal} posts</p>
                </div>
              ))}
        </div>
      </section>

      <section>
        <h1 className="text-3xl font-bold mb-4">Trending Posts</h1>
        <div className="space-y-4">
          {loading
            ? Array(3)
                .fill(null)
                .map((_, index) => (
                  <div key={`trending-loading-${index}`} className="h-32 bg-gray-700 animate-pulse rounded-md"></div>
                ))
            : trendingPosts.map((post, index) => (
                <div key={`${post.id}-${index}`} className="p-4 border border-gray-700 rounded-lg shadow-md bg-gray-800">
                  <p className="text-gray-300">{post.content}</p>
                  <p className="text-sm text-gray-500 mt-2">{post.commentsCount} comments</p>
                </div>
              ))}
        </div>
      </section>

      <section>
        <h1 className="text-3xl font-bold mb-4">Feed</h1>
        <div className="space-y-4">
          {loading
            ? Array(5)
                .fill(null)
                .map((_, index) => (
                  <div key={`feed-loading-${index}`} className="h-24 bg-gray-700 animate-pulse rounded-md"></div>
                ))
            : feed.map((post, index) => (
                <div key={`${post.id}-${index}`} className="p-4 border border-gray-700 rounded-lg shadow-md bg-gray-800">
                  <p className="text-gray-300">{post.content}</p>
                  <p className="text-sm text-gray-500 mt-2">by {post.username}</p>
                </div>
              ))}
        </div>
      </section>
    </div>
  );
}
