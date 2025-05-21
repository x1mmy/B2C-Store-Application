import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';

export async function POST(request: NextRequest) {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Create response
    const response = NextResponse.json(
      { message: 'Successfully logged out' },
      { status: 200 }
    );
    
    // Clear all authentication cookies
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Setting maxAge to 0 effectively deletes the cookie
    });
    
    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });
    
    response.cookies.set('sb-auth-state', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });
    
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 