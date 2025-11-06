'use client';

import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

// shape should match your Prisma model
type Question = {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topics: string[];         // array<enum Topic> in db
  mediaUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const TOPIC_OPTIONS = [
  "ARRAY",
  "STRING",
  "HASH_TABLE",
  "MATH",
  "GREEDY",
  "GRAPH",
  "TREE",
  "DYNAMIC_PROGRAMMING",
  "RECURSION",
  "BACKTRACKING",
] as const;


export default function AdminQuestionsPage() {
  const { authFetch, refreshAccessToken } = useAuth();

  // data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);

  // editing existing
  const [editing, setEditing] = useState<Question | null>(null);

  // create new
  const emptyDraft: Question = {
    id: '',
    title: '',
    description: '',
    difficulty: 'EASY',
    topics: ['ARRAY'],
    mediaUrls: [],
  };
  const [newDraft, setNewDraft] = useState<Question>(emptyDraft);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ui state
  const [loadingList, setLoadingList] = useState(false);
  const [busy, setBusy] = useState(false); // update/delete/create in progress
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // load questions initially
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      setError(null);
      try {
        // GET /question
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_QUESTION_SERVICE_BASE_URL}/api/question`
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load questions');
        }
        const data: Question[] = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load questions');
      } finally {
        setLoadingList(false);
      }
    };
    load();
  }, [authFetch]);

  // ---- CRUD handlers ----

  // UPDATE existing question
  const handleSaveEdit = async () => {
    if (!editing || !editing.id) return;
    setBusy(true);
    setError(null);
    try {
      const body = {
        title: editing.title,
        description: editing.description,
        difficulty: editing.difficulty,
        topics: editing.topics,
        mediaUrls: editing.mediaUrls || [],
      };

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_QUESTION_SERVICE_BASE_URL}/api/question/${encodeURIComponent(editing.id)}`,
        {
          method: 'PUT',
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Update failed');
      }

      const updated: Question = await res.json();

      // update local list
      setQuestions(prev =>
        prev.map(q => (q.id === updated.id ? updated : q))
      );
      setSelected(updated);
      setEditing(updated);
      refreshAccessToken();
    } catch (err) {
      console.error(err);
      setError('Failed to update question');
    } finally {
      setBusy(false);
    }
  };

  // DELETE question
  const handleDelete = async () => {
    if (!selected || !selected.id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_QUESTION_SERVICE_BASE_URL}/api/question/${encodeURIComponent(selected.id)}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Delete failed');
      }

      // remove from list
      setQuestions(prev => prev.filter(q => q.id !== selected.id));
      setSelected(null);
      setEditing(null);
      setShowDeleteConfirm(false);
      refreshAccessToken();
    } catch (err) {
      console.error(err);
      setError('Failed to delete question');
    } finally {
      setBusy(false);
    }
  };

  // CREATE new question
  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = {
        title: newDraft.title,
        description: newDraft.description,
        difficulty: newDraft.difficulty,
        topics: newDraft.topics,
        mediaUrls: newDraft.mediaUrls || [],
      };

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_QUESTION_SERVICE_BASE_URL}/api/question`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Create failed');
      }

      const created: Question = await res.json();
      setQuestions(prev => [created, ...prev]); // prepend newest
      setShowCreateForm(false);
      setNewDraft(emptyDraft);
      refreshAccessToken();
    } catch (err) {
      console.error(err);
      setError('Failed to create question');
    } finally {
      setBusy(false);
    }
  };

  // small helpers for editing arrays
  const handleTopicsChange = (value: string, mode: 'edit' | 'new') => {
    // user types "ARRAY, GRAPH, STRING"
    const arr = value
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);

    if (mode === 'edit' && editing) {
      setEditing({ ...editing, topics: arr });
    } else {
      setNewDraft({ ...newDraft, topics: arr });
    }
  };

  const handleMediaUrlsChange = (value: string, mode: 'edit' | 'new') => {
    // user types "http://x, http://y"
    const arr = value
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (mode === 'edit' && editing) {
      setEditing({ ...editing, mediaUrls: arr });
    } else {
      setNewDraft({ ...newDraft, mediaUrls: arr });
    }
  };

  return (
    <>
      <Header />
      <div className="h-[calc(100vh-4rem)] bg-gray-900 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-100">
              Manage Questions
            </h1>

            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              disabled={busy}
              onClick={() => setShowCreateForm(true)}
            >
              + New Question
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-900 border border-red-700 rounded-md p-4 flex-shrink-0">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 min-h-0 overflow-hidden">
            {/* LEFT PANE: list of questions */}
            <div className="xl:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col overflow-hidden">
              <h3 className="text-md font-semibold text-gray-100 mb-4 flex-shrink-0">
                {loadingList ? 'Loading…' : `Questions (${questions.length})`}
              </h3>

              <ul className="divide-y divide-gray-700 overflow-y-auto flex-1">
                {questions.map((q) => (
                  <li
                    key={q.id}
                    className={`py-4 cursor-pointer rounded-md px-3 ${
                      selected?.id === q.id
                        ? 'bg-gray-700'
                        : 'hover:bg-gray-700/60'
                    }`}
                    onClick={() => {
                      setSelected(q);
                      setEditing(q);
                      setShowDeleteConfirm(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="text-gray-100 font-medium flex items-center gap-2 mb-1">
                        <span className="truncate">{q.title || '(no title)'}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            q.difficulty === 'HARD'
                              ? 'bg-red-600/30 border-red-500 text-red-200'
                              : q.difficulty === 'MEDIUM'
                              ? 'bg-yellow-600/30 border-yellow-500 text-yellow-200'
                              : 'bg-green-600/30 border-green-500 text-green-200'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-2">
                        {q.description}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        Topics: {q.topics?.join(', ') || '—'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT PANE: edit / details */}
            {selected && editing && (
              <div className="xl:col-span-3 h-full flex flex-col min-h-0">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col h-full min-h-0">
                  <h2 className="text-lg font-semibold text-gray-100 mb-4 flex-shrink-0">
                    Edit Question
                  </h2>

                  <div className="overflow-y-auto flex-1 space-y-4 text-sm text-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Title
                      </label>
                      <input
                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                        value={editing.title || ''}
                        disabled={busy}
                        onChange={(e) =>
                          setEditing({ ...editing, title: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500 min-h-[250px]"
                        value={editing.description || ''}
                        disabled={busy}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">
                        Difficulty
                      </label>
                      <select
                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                        value={newDraft.difficulty}
                        disabled={busy}
                        onChange={(e) =>
                          setNewDraft({
                            ...newDraft,
                            difficulty: e.target.value as Question['difficulty'],
                          })
                        }
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">
                            Topic
                        </label>
                        <select
                            className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                            disabled={busy}
                            value={editing.topics && editing.topics.length > 0 ? editing.topics[0] : ""}
                            onChange={(e) => {
                                const chosen = e.target.value;
                                setEditing({
                                    ...editing,
                                    topics: chosen ? [chosen] : [],
                                });
                            }}
                        >
                            {TOPIC_OPTIONS.map((topic) => (
                                <option key={topic} value={topic}>
                                    {topic.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="mt-6 flex items-start gap-3 flex-shrink-0 flex-wrap">
                    <button
                      onClick={handleSaveEdit}
                      disabled={busy}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {busy ? 'Saving…' : 'Save Changes'}
                    </button>

                    {!showDeleteConfirm && (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={busy}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Delete Question
                      </button>
                    )}

                    {showDeleteConfirm && (
                      <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 w-full max-w-sm">
                        <p className="text-red-300 mb-3 text-sm">
                          Are you sure you want to delete this question? This
                          cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleDelete}
                            disabled={busy}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            {busy ? 'Deleting…' : 'Yes, Delete'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={busy}
                            className="border border-gray-500 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CREATE MODAL (simple inline card instead of real modal) */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-100 mb-4">
                  New Question
                </h2>

                <div className="space-y-4 text-sm text-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Title
                    </label>
                    <input
                      className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                      value={newDraft.title}
                      disabled={busy}
                      onChange={(e) =>
                        setNewDraft({ ...newDraft, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500 min-h-[120px]"
                      value={newDraft.description}
                      disabled={busy}
                      onChange={(e) =>
                        setNewDraft({
                          ...newDraft,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Difficulty
                    </label>
                    <select
                      className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                      value={newDraft.difficulty}
                      disabled={busy}
                      onChange={(e) =>
                        setNewDraft({
                          ...newDraft,
                          difficulty: e.target.value as Question['difficulty'],
                        })
                      }
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                        Topic
                    </label>
                    <select
                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                        disabled={busy}
                        value={newDraft.topics && newDraft.topics.length > 0 ? newDraft.topics[0] : ""}
                        onChange={(e) => {
                        const chosen = e.target.value;
                        setNewDraft({
                            ...newDraft,
                            topics: chosen ? [chosen] : [],
                        });
                        }}
                    >
                        {TOPIC_OPTIONS.map((topic) => (
                        <option key={topic} value={topic}>
                            {topic.replace(/_/g, " ")}
                        </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleCreate}
                    disabled={busy}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {busy ? 'Creating…' : 'Create Question'}
                  </button>

                  <button
                    onClick={() => {
                      if (!busy) {
                        setShowCreateForm(false);
                        setNewDraft(emptyDraft);
                      }
                    }}
                    disabled={busy}
                    className="border border-gray-500 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
