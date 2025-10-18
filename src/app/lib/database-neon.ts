import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

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
  password_hash?: string;
  name?: string;
  bio?: string;
  profile_pic?: string;
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

export interface UserWithDetails {
  id: number;
  email: string;
  name?: string;
  bio?: string;
  profile_pic?: string;
  is_admin: boolean;
  created_at: string;
  noteCount: number;
  limits: {
    max_notes: number;
    max_note_length: number;
  };
}

interface UserQueryResult {
  id: number;
  email: string;
  name?: string;
  bio?: string;
  profile_pic?: string;
  is_admin: boolean;
  created_at: string;
  max_notes?: number;
  max_note_length?: number;
  note_count: string;
}

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Password hashing utilities
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  // Use fewer iterations for faster hashing while maintaining security
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    if (!salt || !hash) return false;
    
    // Try with new iterations first (faster)
    let verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    if (hash === verifyHash) return true;
    
    // If that fails, try with old iterations (for backward compatibility)
    verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Track if database is initialized to avoid redundant operations
let isDbInitialized = false;

// Simple in-memory cache for frequently accessed data
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
const CACHE_TTL = {
  USER: 5 * 60 * 1000, // 5 minutes
  NOTES: 2 * 60 * 1000, // 2 minutes
  LIMITS: 10 * 60 * 1000, // 10 minutes
};

function getCacheKey(type: string, identifier: string): string {
  return `${type}:${identifier}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCache(key: string, data: unknown, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

function invalidateCache(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Initialize database tables (only once)
export async function initDatabase() {
  if (isDbInitialized) {
    return; // Skip if already initialized
  }

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        name TEXT,
        bio TEXT,
        profile_pic TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create user_limits table
    await sql`
      CREATE TABLE IF NOT EXISTS user_limits (
        id SERIAL PRIMARY KEY,
        user_email TEXT UNIQUE NOT NULL,
        max_notes INTEGER DEFAULT 100,
        max_note_length INTEGER DEFAULT 300,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
      )
    `;

    // Create notes table
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        user_email TEXT NOT NULL,
        tags TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_user_email ON notes(user_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_limits_user_email ON user_limits(user_email)`;

    // Ensure admin user exists (only check once)
    await ensureAdminUser();

    isDbInitialized = true;
    console.log('Database initialized successfully with Neon');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Separate function to handle admin user setup
async function ensureAdminUser() {
  const adminEmail = 'admin@mywebapp.com';
  const adminPassword = 'admin123';
  
  try {
    const existingAdmin = await sql`
      SELECT id, password_hash FROM users WHERE email = ${adminEmail} LIMIT 1
    `;
    
    if (existingAdmin.length === 0) {
      // Create new admin user
      const hashedPassword = hashPassword(adminPassword);
      await sql`
        INSERT INTO users (email, password_hash, is_admin) 
        VALUES (${adminEmail}, ${hashedPassword}, TRUE)
      `;
    } else if (!existingAdmin[0].password_hash) {
      // Update existing admin without password
      const hashedPassword = hashPassword(adminPassword);
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, is_admin = TRUE
        WHERE email = ${adminEmail}
      `;
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
}

// Database operations
export const dbOperations = {
  // User operations
  createUser: async (email: string, password?: string, isAdmin: boolean = false): Promise<User> => {
    try {
      const hashedPassword = password ? hashPassword(password) : null;
      const result = await sql`
        INSERT INTO users (email, password_hash, is_admin) 
        VALUES (${email}, ${hashedPassword}, ${isAdmin})
        ON CONFLICT (email) DO UPDATE SET 
          password_hash = ${hashedPassword},
          is_admin = ${isAdmin}
        RETURNING *
      `;
      
      const user = result[0] as User;
      
      // Create default limits for new user
      if (!isAdmin) {
        try {
          await sql`
            INSERT INTO user_limits (user_email, max_notes, max_note_length) 
            VALUES (${email}, 100, 300)
          `;
        } catch {
          // User limits might already exist, ignore
          console.log('User limits already exist for', email);
        }
      }
      
      // Invalidate admin caches when a new user is created
      invalidateCache('ALL_USERS');
      invalidateCache('ALL_USERS_DETAILS');
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  getUser: async (email: string): Promise<User | undefined> => {
    const cacheKey = getCacheKey('USER', email);
    const cached = getFromCache<User>(cacheKey);
    if (cached) return cached;

    try {
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      const user = result[0] as User | undefined;
      if (user) {
        setCache(cacheKey, user, CACHE_TTL.USER);
      }
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  },

  updateUserProfile: async (email: string, updates: { name?: string; bio?: string; profile_pic?: string }): Promise<User | undefined> => {
    try {
      const result = await sql`
        UPDATE users 
        SET name = COALESCE(${updates.name}, name),
            bio = COALESCE(${updates.bio}, bio),
            profile_pic = COALESCE(${updates.profile_pic}, profile_pic)
        WHERE email = ${email}
        RETURNING *
      `;
      const user = result[0] as User | undefined;
      if (user) {
        // Update cache with new data
        const cacheKey = getCacheKey('USER', email);
        setCache(cacheKey, user, CACHE_TTL.USER);
        
        // Also invalidate admin lists since user data changed
        invalidateCache('ALL_USERS');
        invalidateCache('ALL_USERS_DETAILS');
      }
      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return undefined;
    }
  },

  updateUserPassword: async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const hashedPassword = hashPassword(newPassword);
      const result = await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}
        WHERE email = ${email}
        RETURNING id
      `;
      return result.length > 0;
    } catch (error) {
      console.error('Error updating user password:', error);
      return false;
    }
  },

  // Note operations
  createNote: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    try {
      const result = await sql`
        INSERT INTO notes (title, content, user_email, tags)
        VALUES (${note.title}, ${note.content}, ${note.user_email}, ${note.tags || ''})
        RETURNING *
      `;
      const newNote = result[0] as Note;
      // Invalidate notes cache for this user
      invalidateCache(getCacheKey('NOTES', note.user_email));
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  getNotes: async (userEmail: string): Promise<Note[]> => {
    const cacheKey = getCacheKey('NOTES', userEmail);
    const cached = getFromCache<Note[]>(cacheKey);
    if (cached) return cached;

    try {
      const result = await sql`
        SELECT * FROM notes 
        WHERE user_email = ${userEmail} 
        ORDER BY updated_at DESC
      `;
      const notes = result as Note[];
      setCache(cacheKey, notes, CACHE_TTL.NOTES);
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  },

  getNote: async (id: number, userEmail: string): Promise<Note | undefined> => {
    try {
      const result = await sql`
        SELECT * FROM notes 
        WHERE id = ${id} AND user_email = ${userEmail}
      `;
      return result[0] as Note | undefined;
    } catch (error) {
      console.error('Error getting note:', error);
      return undefined;
    }
  },

  updateNote: async (id: number, noteUpdate: Partial<Note>, userEmail: string): Promise<Note | undefined> => {
    try {
      const result = await sql`
        UPDATE notes 
        SET title = ${noteUpdate.title || ''}, 
            content = ${noteUpdate.content || ''}, 
            tags = ${noteUpdate.tags || ''}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_email = ${userEmail}
        RETURNING *
      `;
      const note = result[0] as Note | undefined;
      if (note) {
        // Invalidate notes cache for this user
        invalidateCache(getCacheKey('NOTES', userEmail));
      }
      return note;
    } catch (error) {
      console.error('Error updating note:', error);
      return undefined;
    }
  },

  deleteNote: async (id: number, userEmail: string): Promise<boolean> => {
    try {
      const result = await sql`
        DELETE FROM notes 
        WHERE id = ${id} AND user_email = ${userEmail}
        RETURNING id
      `;
      const success = result.length > 0;
      if (success) {
        // Invalidate notes cache for this user
        invalidateCache(getCacheKey('NOTES', userEmail));
      }
      return success;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  searchNotes: async (userEmail: string, query: string): Promise<Note[]> => {
    try {
      const searchTerm = `%${query}%`;
      const result = await sql`
        SELECT * FROM notes 
        WHERE user_email = ${userEmail} 
        AND (title ILIKE ${searchTerm} OR content ILIKE ${searchTerm} OR tags ILIKE ${searchTerm})
        ORDER BY updated_at DESC
      `;
      return result as Note[];
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  },

  // Admin operations
  getAllUsers: async (): Promise<User[]> => {
    const cacheKey = getCacheKey('ALL_USERS', 'admin');
    const cached = getFromCache<User[]>(cacheKey);
    if (cached) return cached;

    try {
      const result = await sql`SELECT * FROM users ORDER BY created_at DESC`;
      const users = result as User[];
      setCache(cacheKey, users, CACHE_TTL.USER);
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  // Optimized function to get users with their counts and limits in fewer queries
  getAllUsersWithDetails: async (): Promise<UserWithDetails[]> => {
    const cacheKey = getCacheKey('ALL_USERS_DETAILS', 'admin');
    const cached = getFromCache<UserWithDetails[]>(cacheKey);
    if (cached) return cached;

    try {
      const result = await sql`
        SELECT 
          u.*,
          ul.max_notes,
          ul.max_note_length,
          COALESCE(note_counts.note_count, 0) as note_count
        FROM users u
        LEFT JOIN user_limits ul ON u.email = ul.user_email
        LEFT JOIN (
          SELECT user_email, COUNT(*) as note_count 
          FROM notes 
          GROUP BY user_email
        ) note_counts ON u.email = note_counts.user_email
        ORDER BY u.created_at DESC
      `;
      
      const usersWithDetails = (result as UserQueryResult[]).map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        bio: row.bio,
        profile_pic: row.profile_pic,
        is_admin: row.is_admin,
        created_at: row.created_at,
        noteCount: parseInt(row.note_count) || 0,
        limits: {
          max_notes: row.max_notes || 100,
          max_note_length: row.max_note_length || 300
        }
      }));
      
      setCache(cacheKey, usersWithDetails, CACHE_TTL.USER);
      return usersWithDetails;
    } catch (error) {
      console.error('Error getting users with details:', error);
      return [];
    }
  },

  deleteUser: async (email: string): Promise<boolean> => {
    try {
      const adminEmail = 'admin@mywebapp.com';
      if (email === adminEmail) return false; // Can't delete admin
      
      // Check if user exists and is not admin before deletion
      const user = await sql`SELECT email, is_admin FROM users WHERE email = ${email}`;
      if (user.length === 0 || user[0].is_admin) {
        return false;
      }
      
      // Delete in correct order to avoid foreign key constraints
      await sql`DELETE FROM notes WHERE user_email = ${email}`;
      await sql`DELETE FROM user_limits WHERE user_email = ${email}`;
      
      const result = await sql`
        DELETE FROM users 
        WHERE email = ${email} AND is_admin = FALSE
        RETURNING id
      `;
      
      const success = result.length > 0;
      
      // Invalidate all relevant caches if deletion was successful
      if (success) {
        invalidateCache(getCacheKey('USER', email));
        invalidateCache(getCacheKey('NOTES', email));
        invalidateCache(getCacheKey('LIMITS', email));
        invalidateCache('ALL_USERS');
        invalidateCache('ALL_USERS_DETAILS');
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // User limits operations
  getUserLimits: async (userEmail: string): Promise<UserLimits | undefined> => {
    const cacheKey = getCacheKey('LIMITS', userEmail);
    const cached = getFromCache<UserLimits>(cacheKey);
    if (cached) return cached;

    try {
      const result = await sql`
        SELECT * FROM user_limits WHERE user_email = ${userEmail}
      `;
      const limits = result[0] as UserLimits | undefined;
      if (limits) {
        setCache(cacheKey, limits, CACHE_TTL.LIMITS);
      }
      return limits;
    } catch (error) {
      console.error('Error getting user limits:', error);
      return undefined;
    }
  },

  updateUserLimits: async (userEmail: string, maxNotes: number, maxNoteLength: number): Promise<UserLimits> => {
    try {
      const result = await sql`
        INSERT INTO user_limits (user_email, max_notes, max_note_length, updated_at) 
        VALUES (${userEmail}, ${maxNotes}, ${maxNoteLength}, CURRENT_TIMESTAMP)
        ON CONFLICT (user_email) DO UPDATE SET 
          max_notes = ${maxNotes}, 
          max_note_length = ${maxNoteLength}, 
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      
      const limits = result[0] as UserLimits;
      
      // Invalidate relevant caches
      invalidateCache(getCacheKey('LIMITS', userEmail));
      invalidateCache('ALL_USERS_DETAILS');
      
      return limits;
    } catch (error) {
      console.error('Error updating user limits:', error);
      throw error;
    }
  },

  // Admin note operations
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const result = await sql`SELECT * FROM notes ORDER BY updated_at DESC`;
      return result as Note[];
    } catch (error) {
      console.error('Error getting all notes:', error);
      return [];
    }
  },

  adminDeleteNote: async (id: number): Promise<boolean> => {
    try {
      const result = await sql`
        DELETE FROM notes WHERE id = ${id}
        RETURNING id
      `;
      return result.length > 0;
    } catch (error) {
      console.error('Error admin deleting note:', error);
      return false;
    }
  },

  // Get user note count
  getUserNoteCount: async (userEmail: string): Promise<number> => {
    try {
      const result = await sql`
        SELECT COUNT(*) as count FROM notes WHERE user_email = ${userEmail}
      `;
      return Number(result[0].count);
    } catch (error) {
      console.error('Error getting user note count:', error);
      return 0;
    }
  }
};