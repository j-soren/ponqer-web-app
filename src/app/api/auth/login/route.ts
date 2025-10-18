import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = dbOperations.getUser(email);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please sign up first.' },
        { status: 404 }
      );
    }

    // In a real app, you would verify the password hash here
    // For demo purposes, we'll accept any non-empty password
    if (password.length > 0) {
      return NextResponse.json({
        success: true,
        user: { email: existingUser.email, is_admin: existingUser.is_admin }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}