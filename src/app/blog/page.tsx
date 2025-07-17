import React from 'react';

async function getBlogs() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blog`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch blogs');
    }
    return res.json();
}

export default async function BlogPage() {
    const blogs = await getBlogs();

    return (
        <main>
            <h1>Blog Posts</h1>
            <ul>
                {blogs.map((blog: { id: number; title: string }) => (
                    <li key={blog.id}>{blog.title}</li>
                ))}
            </ul>
        </main>
    );
}