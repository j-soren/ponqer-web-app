import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/app/lib/database-neon';

// GET /api/notes - Get all notes for user
export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('user_email');
    const search = searchParams.get('search');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Check if user exists and is authenticated
    const user = await dbOperations.getUser(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 401 }
      );
    }

    let notes;
    if (search && search.trim()) {
      notes = await dbOperations.searchNotes(userEmail, search.trim());
    } else {
      notes = await dbOperations.getNotes(userEmail);
    }

    return NextResponse.json({ notes, success: true });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { title, content, user_email, tags } = body;

    if (!title || !content || !user_email) {
      return NextResponse.json(
        { error: 'Title, content, and user_email are required' },
        { status: 400 }
      );
    }

    // Check if user exists and is authenticated
    const user = await dbOperations.getUser(user_email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 401 }
      );
    }

    // Check user limits (skip for admin users)
    if (!user.is_admin) {
      const userLimits = await dbOperations.getUserLimits(user_email);
      const limits = userLimits || { max_notes: 100, max_note_length: 300 };
      
      // Check note count limit
      const currentNoteCount = await dbOperations.getUserNoteCount(user_email);
      if (currentNoteCount >= limits.max_notes) {
        return NextResponse.json(
          { error: `You have reached your limit of ${limits.max_notes} notes` },
          { status: 400 }
        );
      }
      
      // Check note length limit
      if (content.trim().length > limits.max_note_length) {
        return NextResponse.json(
          { error: `Note content exceeds maximum length of ${limits.max_note_length} characters` },
          { status: 400 }
        );
      }
    }

    const note = await dbOperations.createNote({
      title: title.trim(),
      content: content.trim(),
      user_email,
      tags: tags || ''
    });

    return NextResponse.json({ note, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
