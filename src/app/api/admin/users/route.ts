import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '../../../lib/database';

async function isAdminUser(email: string): Promise<boolean> {
  const user = dbOperations.getUser(email);
  return Boolean(user?.is_admin);
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('user-email');
    
    if (!userEmail || !await isAdminUser(userEmail)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = dbOperations.getAllUsers();
    const usersWithCounts = users.map(user => {
      const noteCount = dbOperations.getUserNoteCount(user.email);
      const limits = dbOperations.getUserLimits(user.email);
      return {
        ...user,
        noteCount,
        limits: limits || { max_notes: 100, max_note_length: 300 }
      };
    });

    return NextResponse.json({
      success: true,
      users: usersWithCounts
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('user-email');
    const { targetEmail } = await request.json();
    
    if (!userEmail || !await isAdminUser(userEmail)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Target email is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves or other admins
    const targetUser = dbOperations.getUser(targetEmail);
    if (Boolean(targetUser?.is_admin)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete admin users' },
        { status: 400 }
      );
    }

    const deleted = dbOperations.deleteUser(targetEmail);
    
    if (deleted) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'User not found or could not be deleted' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}