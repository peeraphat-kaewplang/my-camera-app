import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

type Blog = {
    id: number;
    title: string;
    content: string;
    author: string;
    date: string;
};

function getMockBlogs(): Blog[] {
    return [
        {
            id: 1,
            title: 'First Blog Post',
            content: 'This is the content of the first blog post.',
            author: 'John Doe',
            date: '2024-06-01',
        },
        {
            id: 2,
            title: 'Second Blog Post',
            content: 'This is the content of the second blog post.',
            author: 'Jane Smith',
            date: '2024-06-02',
        },
    ];
}


export async function GET(request: Request) {
    const headers = request.headers;
    const contentType = headers.get("Content-Type");
    const authorization = headers.get("Authorization");

    const blogs = getMockBlogs();
    return NextResponse.json({
        blogs,
        receivedHeaders: {
            contentType,
            authorization,
        },
    });
}