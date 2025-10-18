'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Note {
  id: number;
  title: string;
  content: string;
  user_email: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export default function LibraryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    fetchNotes();
  }, [isAuthenticated, router, user]);

  const fetchNotes = async (search?: string) => {
    if (!user?.email) return;

    try {
      const params = new URLSearchParams({
        user_email: user.email,
        ...(search && { search })
      });
      
      const response = await fetch(`/api/notes?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchNotes(searchTerm);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!user?.email || !confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${noteId}?user_email=${user.email}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || '');
  };

  const handleSaveEdit = async () => {
    if (!selectedNote || !user?.email) return;

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          tags: editTags.trim(),
          user_email: user.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(notes.map(note => 
          note.id === selectedNote.id ? data.note : note
        ));
        setSelectedNote(data.note);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Library
            </h1>
            <span className="text-white/60 text-sm">({notes.length} notes)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/new-thoughts')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Note
            </button>
            <span className="text-sm text-white/60">{user?.email}</span>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar - Notes List */}
        <div className="w-1/3 p-4 border-r border-white/10">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  fetchNotes();
                }}
                className="mt-2 text-sm text-white/60 hover:text-white"
              >
                Clear search
              </button>
            )}
          </form>

          {/* Notes List */}
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="text-center text-white/60 py-8">Loading...</div>
            ) : notes.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedNote?.id === note.id
                      ? 'bg-purple-500/20 border-purple-400/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  } border backdrop-blur-sm`}
                >
                  <h3 className="text-white font-medium truncate">{note.title}</h3>
                  <p className="text-white/60 text-sm mt-1 line-clamp-2">{note.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-white/40">{formatDate(note.updated_at)}</span>
                    {note.tags && (
                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">
                        {note.tags.split(',')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Note Detail */}
        <div className="flex-1 p-6">
          {selectedNote ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 h-full">
              {isEditing ? (
                /* Edit Mode */
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Note</h2>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-white/70 border border-white/20 rounded-lg hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white mb-4 text-xl font-medium"
                  />
                  
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Tags (comma separated)"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white mb-4"
                  />
                  
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white resize-none"
                  />
                </div>
              ) : (
                /* View Mode */
                <div className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-3">{selectedNote.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>Created: {formatDate(selectedNote.created_at)}</span>
                        <span>Updated: {formatDate(selectedNote.updated_at)}</span>
                      </div>
                      {selectedNote.tags && (
                        <div className="flex gap-2 mt-3">
                          {selectedNote.tags.split(',').map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditNote(selectedNote)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                      {selectedNote.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/60">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a note to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}