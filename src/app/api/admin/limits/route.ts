import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/app/lib/database-neon';

async function isAdminUser(email: string): Promise<boolean> {
  const user = await dbOperations.getUser(email);
  return Boolean(user?.is_admin);
}

export async function PUT(request: NextRequest) {
  try {
    
    const userEmail = request.headers.get('user-email');
    const { targetEmail, maxNotes, maxNoteLength } = await request.json();
    
    if (!userEmail || !await isAdminUser(userEmail)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!targetEmail || maxNotes < 0 || maxNoteLength < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await dbOperations.getUser(targetEmail);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Target user not found' },
        { status: 404 }
      );
    }

    const updatedLimits = await dbOperations.updateUserLimits(targetEmail, maxNotes, maxNoteLength);
    
    return NextResponse.json({
      success: true,
      limits: updatedLimits
    });

  } catch (error) {
    console.error('Update limits error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user limits' },
      { status: 500 }
    );
  }
}