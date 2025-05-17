// /api/auth/register
// this is the route for the register page
// will be used to register the user, validate the user, and redirect the user to the cart page

// - will use supabase auth to register the user
// - as well as check against the users table to see if the user is valid
// - and then create a new user in the users table

import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user in the users table
        const { data: userData, error: userError } = await supabase.from('users').insert({
            email: email,
            password: hashedPassword,
        });

        if (userError) {
            return NextResponse.json({ error: userError.message }, { status: 401 });
        }

        return NextResponse.json({ data: userData }, { status: 200 });
}

