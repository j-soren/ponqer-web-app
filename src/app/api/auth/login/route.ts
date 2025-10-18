import { NextRequest, NextResponse } from 'next/server';
import { dbOperations, verifyPassword } from '@/app/lib/database-neon';

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
    const existingUser = await dbOperations.getUser(email);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    if (!existingUser.password_hash) {
      return NextResponse.json(
        { success: false, error: 'Account setup incomplete. Please contact admin.' },
        { status: 401 }
      );
    }

    const isValidPassword = verifyPassword(password, existingUser.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { email: existingUser.email, is_admin: existingUser.is_admin }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}