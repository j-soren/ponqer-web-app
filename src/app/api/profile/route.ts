import { NextRequest, NextResponse } from 'next/server';
import { dbOperations, verifyPassword } from '@/app/lib/database-neon';

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await dbOperations.getUser(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile without password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userProfile } = user;
    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { email, name, bio, profile_pic } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate bio length (50 characters max)
    if (bio && bio.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Bio must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await dbOperations.getUser(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update profile
    const updatedUser = await dbOperations.updateUserProfile(email, {
      name: name?.trim(),
      bio: bio?.trim(),
      profile_pic: profile_pic
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Return updated profile without password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userProfile } = updatedUser;
    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Change password
export async function PATCH(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { email, currentPassword, newPassword } = body;

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, current password, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user exists and verify current password
    const user = await dbOperations.getUser(email);
    if (!user || !user.password_hash) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    const success = await dbOperations.updateUserPassword(email, newPassword);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}