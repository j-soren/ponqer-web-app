import Database from 'better-sqlite3';
import path from 'path';

// Initialize database connection
const dbPath = path.join(process.cwd(), 'notes.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
const initDB = () => {
  // Users table with admin role
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add is_admin column if it doesn't exist
  try {
    db.exec('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
  } catch (error: any) {
    // Column already exists or other error, continue
    if (!error.message.includes('duplicate column name')) {
      console.log('Migration note:', error.message);
    }
  }

  // User limits table for configurable restrictions
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      max_notes INTEGER DEFAULT 100,
      max_note_length INTEGER DEFAULT 300,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_email) REFERENCES users (email)
    )
  `);

  // Notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_email TEXT NOT NULL,
      tags TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_email) REFERENCES users (email)
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notes_user_email ON notes(user_email);
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
    CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
  `);
};

// Initialize admin user if it doesn't exist
const createAdminUser = () => {
  const adminEmail = 'admin@mywebapp.com';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ? AND is_admin = TRUE').get(adminEmail);
  if (!existingAdmin) {
    const stmt = db.prepare('INSERT OR REPLACE INTO users (email, is_admin) VALUES (?, TRUE)');
    stmt.run(adminEmail);
    console.log('Admin user created:', adminEmail);
  }
};

// Initialize database
initDB();
// Create admin user after database initialization
createAdminUser();

export interface Note {
  id?: number;
  title: string;
  content: string;
  user_email: string;
  tags?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id?: number;
  email: string;
  is_admin?: boolean;
  created_at?: string;
}

export interface UserLimits {
  id?: number;
  user_email: string;
  max_notes: number;
  max_note_length: number;
  created_at?: string;
  updated_at?: string;
}


// Database operations
export const dbOperations = {
  // User operations
  createUser: (email: string, isAdmin: boolean = false): User => {
    const stmt = db.prepare('INSERT OR IGNORE INTO users (email, is_admin) VALUES (?, ?)');
    const result = stmt.run(email, isAdmin);
    
    // Create default limits for new user
    if (result.changes > 0 && !isAdmin) {
      const limitsStmt = db.prepare('INSERT INTO user_limits (user_email, max_notes, max_note_length) VALUES (?, 100, 300)');
      limitsStmt.run(email);
    }
    
    return { email, id: result.lastInsertRowid as number, is_admin: isAdmin };
  },

  getUser: (email: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  // Note operations
  createNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Note => {
    const stmt = db.prepare(`
      INSERT INTO notes (title, content, user_email, tags)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(note.title, note.content, note.user_email, note.tags || '');
    
    return {
      ...note,
      id: result.lastInsertRowid as number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  getNotes: (userEmail: string): Note[] => {
    const stmt = db.prepare(`
      SELECT * FROM notes 
      WHERE user_email = ? 
      ORDER BY updated_at DESC
    `);
    return stmt.all(userEmail) as Note[];
  },

  getNote: (id: number, userEmail: string): Note | undefined => {
    const stmt = db.prepare(`
      SELECT * FROM notes 
      WHERE id = ? AND user_email = ?
    `);
    return stmt.get(id, userEmail) as Note | undefined;
  },

  updateNote: (id: number, note: Partial<Note>, userEmail: string): Note | undefined => {
    const currentNote = dbOperations.getNote(id, userEmail);
    if (!currentNote) return undefined;

    const updatedNote = { ...currentNote, ...note, updated_at: new Date().toISOString() };
    const stmt = db.prepare(`
      UPDATE notes 
      SET title = ?, content = ?, tags = ?, updated_at = ?
      WHERE id = ? AND user_email = ?
    `);
    
    stmt.run(
      updatedNote.title, 
      updatedNote.content, 
      updatedNote.tags || '', 
      updatedNote.updated_at,
      id, 
      userEmail
    );
    
    return updatedNote;
  },

  deleteNote: (id: number, userEmail: string): boolean => {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ? AND user_email = ?');
    const result = stmt.run(id, userEmail);
    return result.changes > 0;
  },

  searchNotes: (userEmail: string, query: string): Note[] => {
    const stmt = db.prepare(`
      SELECT * FROM notes 
      WHERE user_email = ? AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)
      ORDER BY updated_at DESC
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(userEmail, searchTerm, searchTerm, searchTerm) as Note[];
  },

  // Admin operations
  getAllUsers: (): User[] => {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all() as User[];
  },

  deleteUser: (email: string): boolean => {
    // Delete user's notes first
    const deleteNotesStmt = db.prepare('DELETE FROM notes WHERE user_email = ?');
    deleteNotesStmt.run(email);
    
    // Delete user limits
    const deleteLimitsStmt = db.prepare('DELETE FROM user_limits WHERE user_email = ?');
    deleteLimitsStmt.run(email);
    
    // Delete user
    const deleteUserStmt = db.prepare('DELETE FROM users WHERE email = ? AND is_admin = FALSE');
    const result = deleteUserStmt.run(email);
    return result.changes > 0;
  },

  // User limits operations
  getUserLimits: (userEmail: string): UserLimits | undefined => {
    const stmt = db.prepare('SELECT * FROM user_limits WHERE user_email = ?');
    return stmt.get(userEmail) as UserLimits | undefined;
  },

  updateUserLimits: (userEmail: string, maxNotes: number, maxNoteLength: number): UserLimits => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_limits (user_email, max_notes, max_note_length, updated_at) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(userEmail, maxNotes, maxNoteLength);
    
    return {
      user_email: userEmail,
      max_notes: maxNotes,
      max_note_length: maxNoteLength,
      updated_at: new Date().toISOString()
    };
  },

  // Admin note operations
  getAllNotes: (): Note[] => {
    const stmt = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC');
    return stmt.all() as Note[];
  },

  adminDeleteNote: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // Get user note count
  getUserNoteCount: (userEmail: string): number => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM notes WHERE user_email = ?');
    const result = stmt.get(userEmail) as { count: number };
    return result.count;
  }
};

export default db;