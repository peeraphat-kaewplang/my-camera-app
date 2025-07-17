import { cookies } from "next/headers";
import React from "react";
async function getBlogs() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", // กำหนด Content-Type เป็น application/json
      Authorization: `Bearer ${token}`, // ส่ง token ใน header
    },
    cache: "no-store",
    credentials: "include", // เพิ่มบรรทัดนี้
  });

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }
  return res.json();
}

export default async function BlogPage() {
  const {blogs , ...receivedHeaders} = await getBlogs();
  return (
    <main>
      <h1>Blog Posts</h1>
      <ul>
        {blogs.map((blog: { id: number; title: string }) => (
          <li key={blog.id}>{blog.title}</li>
        ))}
      </ul>
      <p>
        {receivedHeaders?.authorization
          ?? `Received Authorization Header: ${receivedHeaders.authorization}` }
      </p>
    </main>
  );
}
