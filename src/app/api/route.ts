import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
    

    const { userId } = await req.json();
    
    if (!userId) {
          
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    // Generate token
    const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
  
    // Set token in cookie using NextResponse cookies API
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.headers.set(
        'Set-Cookie',
        `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax;${process.env.NODE_ENV === 'production' ? ' Secure;' : ''}`
    );
   
    return response;
}