// /api/auth/login
// this is the route for the login page
// will be used to login the user, validate the user, and redirect the user to the cart page

// - will use supabase auth to login the user
// - as well as check against the users table to see if the user is valid
// - will create a user session token

import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // get the email and password from the request
        const { email, password } = await request.json();

        if (!email || !password) {
            console.error('Login attempt failed: Missing email or password');
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        console.log(`Login attempt for email: ${email}`);

        // sign in the user with the supabase auth 
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Supabase auth error:', error.message, 'Error code:', error.code);
            
            // Provide more specific error messages based on error type
            if (error.message.includes('Invalid login credentials')) {
                return NextResponse.json({ 
                    error: 'Invalid email or password',
                    details: error.message,
                    code: error.code
                }, { status: 401 });
            }
            
            if (error.code === 'email_not_confirmed') {
                return NextResponse.json({ 
                    error: 'Please verify your email address before logging in',
                    details: 'Email not confirmed',
                    code: error.code
                }, { status: 401 });
            }
            
            return NextResponse.json({ 
                error: error.message,
                details: error.code,
                timestamp: new Date().toISOString()
            }, { status: 401 });
        }
        
        // If login was successful, set the session cookies
        if (data?.session) {
            console.log('Setting session cookies with token:', data.session.access_token.substring(0, 10) + '...');
            
            // Create a response object first
            const response = NextResponse.json({ 
                message: 'Login successful',
                user: {
                    id: data.user?.id,
                    email: data.user?.email
                }
            }, { status: 200 });
            
            // Set the cookies on the response object
            // Use secure settings but ensure cookies work in development
            const secure = process.env.NODE_ENV === 'production';
            const expirySeconds = data.session.expires_in;
            
            // Set the access token cookie (HTTP only for security)
            response.cookies.set('sb-access-token', data.session.access_token, {
                httpOnly: true,
                secure: secure,
                sameSite: 'lax',
                path: '/',
                maxAge: expirySeconds
            });
            
            // Set the refresh token cookie (HTTP only for security) - extended lifetime
            response.cookies.set('sb-refresh-token', data.session.refresh_token, {
                httpOnly: true,
                secure: secure,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30 // 30 days for refresh token
            });
            
            // Set an auth state cookie (visible to JavaScript for UI state) - extended lifetime
            response.cookies.set('sb-auth-state', 'authenticated', {
                httpOnly: false, // Visible to client JS
                secure: secure,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30 // 30 days to match refresh token
            });
            
            // Set cache control headers to prevent caching of this response
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            response.headers.set('Pragma', 'no-cache');
            response.headers.set('Expires', '0');
            
            console.log('Login successful for user:', data.user?.id);
            console.log('Session expires in:', expirySeconds, 'seconds');
            console.log('Cookies set with extended expiry (30 days)');
            
            return response;
        }
        
        // This should not happen, but just in case
        console.error('Login succeeded but no session was created!');
        return NextResponse.json({ 
            error: 'Authentication succeeded but session creation failed',
        }, { status: 500 });
    } catch (e) {
        console.error('Unexpected error in login route:', e);
        return NextResponse.json({ 
            error: 'Server error processing login request',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
    }
}