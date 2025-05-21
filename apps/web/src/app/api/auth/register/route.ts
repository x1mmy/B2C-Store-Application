// /api/auth/register
// this is the route for the register page
// will be used to register the user, validate the user, and redirect the user to the cart page

// - will use supabase auth to register the user
// - as well as check against the users table to see if the user is valid
// - and then create a new user in the users table

import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        
        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }
        
        // Minimum password requirements check
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        console.log(`Attempting to register user with email: ${email}`);
        
        // Create a new user using the supabase auth
        const { data: userData, error: userError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (userError) {
            console.error('Supabase auth error:', userError);
            return NextResponse.json(
                { error: userError.message },
                { status: 401 }
            );
        }

        console.log('User registration successful:', userData);
        return NextResponse.json({ success: true, data: userData }, { status: 200 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: "An unexpected error occurred during registration" },
            { status: 500 }
        );
    }
}

