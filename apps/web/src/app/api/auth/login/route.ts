// /api/auth/login
// this is the route for the login page
// will be used to login the user, validate the user, and redirect the user to the cart page

// - will use supabase auth to login the user
// - as well as check against the users table to see if the user is valid

import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';
import bcrypt from 'bcrypt';



export async function POST(request: NextRequest) {
    // get the email and password from the request
    const { email, password } = await request.json();

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // sign in the user comapring it against the users table  
    const { data, error } = await supabase
        .from('users') // from the user table
        .select('*') // select all columns
        .eq('email', email) // is equal to the email column
        .eq('password', hashedPassword); // is equal to the password column

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
    

    return NextResponse.json({ data }, { status: 200 });
}