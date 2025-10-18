import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/app/lib/database-neon';

async function isAdminUser(email: string): Promise<boolean> {
  const user = await dbOperations.getUser(email);
  return Boolean(user?.is_admin);
}

export async function GET(request: NextRequest) {
  try {
    
    const userEmail = request.headers.get('user-email');
    const { searchParams } = new URL(request.url);
    const targetUserEmail = searchParams.get('user_email');
    
    if (!userEmail || !await isAdminUser(userEmail)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    let notes;
    if (targetUserEmail) {
      // Get notes for specific user
      notes = await dbOperations.getNotes(targetUserEmail);
    } else {
      // Get all notes
      notes = await dbOperations.getAllNotes();
    }

    return NextResponse.json({
      success: true,
      notes
    });

  } catch (error) {
    console.error('Get admin notes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    
    const userEmail = request.headers.get('user-email');
    const { noteId } = await request.json();
    
    if (!userEmail || !await isAdminUser(userEmail)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!noteId || typeof noteId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid note ID is required' },
        { status: 400 }
      );
    }

    const deleted = await dbOperations.adminDeleteNote(noteId);
    
    if (deleted) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Note not found or could not be deleted' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}