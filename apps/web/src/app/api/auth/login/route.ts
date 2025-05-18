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
            // Create a response object first
            const response = NextResponse.json({ 
                message: 'Login successful',
                user: {
                    id: data.user?.id,
                    email: data.user?.email
                }
            }, { status: 200 });
            
            // TODO: EXPLAIN THIS
            //Set the cookies on the response object
            response.cookies.set('sb-access-token', data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: data.session.expires_in
            });
            
            response.cookies.set('sb-refresh-token', data.session.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });
            
            response.cookies.set('sb-auth-state', 'authenticated', {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: data.session.expires_in
            });
            
            console.log('Login successful for user:', data.user?.id);
            return response;
        }
        
        console.log('Login successful for user:', data.user?.id);
        return NextResponse.json({ 
            message: 'Login successful',
            user: {
                id: data.user?.id,
                email: data.user?.email
            }
        }, { status: 200 });
    } catch (e) {
        console.error('Unexpected error in login route:', e);
        return NextResponse.json({ 
            error: 'Server error processing login request',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
    }
}