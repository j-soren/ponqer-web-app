'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
  noteCount: number;
  limits: {
    max_notes: number;
    max_note_length: number;
  };
}

interface Note {
  id: number;
  title: string;
  content: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'notes'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit limits state
  const [editingLimits, setEditingLimits] = useState<{ email: string; maxNotes: number; maxNoteLength: number } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'user-email': user?.email || '' }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/notes', {
        headers: { 'user-email': user?.email || '' }
      });
      const data = await response.json();
      
      if (data.success) {
        setNotes(data.notes);
      } else {
        setError(data.error || 'Failed to fetch notes');
      }
    } catch (error) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNotes = async (userEmail: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/notes?user_email=${encodeURIComponent(userEmail)}`, {
        headers: { 'user-email': user?.email || '' }
      });
      const data = await response.json();
      
      if (data.success) {
        setUserNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to fetch user notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (targetEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${targetEmail}? This will also delete all their notes.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-email': user?.email || ''
        },
        body: JSON.stringify({ targetEmail })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers(); // Refresh users list
        if (selectedUser?.email === targetEmail) {
          setSelectedUser(null);
          setUserNotes([]);
        }
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const deleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/notes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'user-email': user?.email || ''
        },
        body: JSON.stringify({ noteId })
      });

      const data = await response.json();
      if (data.success) {
        if (activeTab === 'notes') {
          fetchAllNotes(); // Refresh all notes
        }
        if (selectedUser) {
          fetchUserNotes(selectedUser.email); // Refresh user notes
        }
        fetchUsers(); // Refresh users to update note counts
      } else {
        alert(data.error || 'Failed to delete note');
      }
    } catch (error) {
      alert('Failed to delete note');
    }
  };

  const updateUserLimits = async (targetEmail: string, maxNotes: number, maxNoteLength: number) => {
    try {
      const response = await fetch('/api/admin/limits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-email': user?.email || ''
        },
        body: JSON.stringify({ targetEmail, maxNotes, maxNoteLength })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers(); // Refresh users list with updated limits
        setEditingLimits(null);
      } else {
        alert(data.error || 'Failed to update limits');
      }
    } catch (error) {
      alert('Failed to update limits');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchAllNotes();
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'users'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'notes'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            All Notes ({notes.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {activeTab === 'users' && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h3>
                {users.map((userData) => (
                  <div key={userData.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {userData.email}
                          {userData.is_admin && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {userData.noteCount} notes • Max: {userData.limits.max_notes} notes, {userData.limits.max_note_length} chars
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(userData);
                            fetchUserNotes(userData.email);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View Notes
                        </button>
                        <button
                          onClick={() => setEditingLimits({
                            email: userData.email,
                            maxNotes: userData.limits.max_notes,
                            maxNoteLength: userData.limits.max_note_length
                          })}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium"
                        >
                          Edit Limits
                        </button>
                        {!userData.is_admin && (
                          <button
                            onClick={() => deleteUser(userData.email)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected User Notes */}
              <div className="space-y-4">
                {selectedUser ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notes for {selectedUser.email}
                    </h3>
                    {userNotes.map((note) => (
                      <div key={note.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{note.title}</h4>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {note.content.substring(0, 150)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Select a user to view their notes</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && !loading && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Notes</h3>
              {notes.map((note) => (
                <div key={note.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{note.title}</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{note.user_email}</p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {note.content.substring(0, 200)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Limits Modal */}
        {editingLimits && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Edit Limits for {editingLimits.email}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Notes
                  </label>
                  <input
                    type="number"
                    value={editingLimits.maxNotes}
                    onChange={(e) => setEditingLimits({
                      ...editingLimits,
                      maxNotes: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Note Length
                  </label>
                  <input
                    type="number"
                    value={editingLimits.maxNoteLength}
                    onChange={(e) => setEditingLimits({
                      ...editingLimits,
                      maxNoteLength: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => updateUserLimits(editingLimits.email, editingLimits.maxNotes, editingLimits.maxNoteLength)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditingLimits(null)}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}