// /api/auth/login
// this is the route for the login page
// will be used to login the user, validate the user, and redirect the user to the cart page

// - will use supabase auth to login the user
// - as well as check against the users table to see if the user is valid

import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';




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
        
        console.log('Login successful for user:', data.user?.id);
        return NextResponse.json({ data }, { status: 200 });
    } catch (e) {
        console.error('Unexpected error in login route:', e);
        return NextResponse.json({ 
            error: 'Server error processing login request',
            details: e instanceof Error ? e.message : 'Unknown error'
        }, { status: 500 });
    }
}