import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ApiError, authApi, todoApi } from './api';
import { useAuth } from './AuthContext';
import type { Todo } from './types';

const messageFor = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';

function Spinner() {
  return <span className="spinner" aria-label="Loading" />;
}

function AuthPage({ register }: { register?: boolean }) {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/todos" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Email and password are required.');
    if (register && password !== confirmPassword) return setError('Passwords do not match.');
    setBusy(true);
    try {
      if (register) {
        await authApi.register(email.trim(), password);
      }
      const credentials = await authApi.login(email.trim(), password);
      login(credentials);
      navigate('/todos', { replace: true });
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-mark">✓</span>
          <span>Taskly</span>
        </div>
        <p className="eyebrow">YOUR PRODUCTIVE SPACE</p>
        <h1>{register ? 'Create your account' : 'Welcome back'}</h1>
        <p className="subtle">
          {register
            ? 'Start organizing what matters today.'
            : 'Sign in to pick up where you left off.'}
        </p>
        <form onSubmit={submit} noValidate>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={busy}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={register ? 'new-password' : 'current-password'}
              placeholder="Your password"
              disabled={busy}
            />
          </label>
          {register && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Repeat your password"
                disabled={busy}
              />
            </label>
          )}
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <button className="primary wide" disabled={busy}>
            {busy && <Spinner />}
            {register ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="switch">
          {register ? 'Already have an account?' : 'New to Taskly?'}{' '}
          <a href={register ? '/login' : '/register'}>
            {register ? 'Sign in' : 'Create an account'}
          </a>
        </p>
      </section>
    </main>
  );
}

function TodoDialog({
  todo,
  onClose,
  onSave,
}: {
  todo?: Todo;
  onClose: () => void;
  onSave: (title: string, completed: boolean) => Promise<void>;
}) {
  const [title, setTitle] = useState(todo?.title ?? '');
  const [completed, setCompleted] = useState(Boolean(todo?.completed));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return setError('A task title is required.');
    setBusy(true);
    setError('');
    try {
      await onSave(title.trim(), completed);
      onClose();
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="overlay" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <button className="icon-button close" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
        <p className="eyebrow">{todo ? 'UPDATE TASK' : 'NEW TASK'}</p>
        <h2 id="dialog-title">{todo ? 'Edit task' : 'What needs doing?'}</h2>
        <form onSubmit={submit}>
          <label>
            Task title
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
              maxLength={255}
              placeholder="e.g. Prepare the weekly update"
            />
          </label>
          {todo && (
            <label className="check-row">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />{' '}
              Mark as complete
            </label>
          )}
          {error && <p className="notice error">{error}</p>}
          <div className="dialog-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button className="primary" disabled={busy}>
              {busy && <Spinner />}
              {todo ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TodosPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [dialog, setDialog] = useState<Todo | 'new' | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setTodos((await todoApi.list()).filter((todo) => todo.userId === user!.id));
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [user?.id]);
  const visible = useMemo(
    () =>
      todos.filter((todo) => {
        if (filter === 'all') return true;
        return filter === 'completed' ? Boolean(todo.completed) : !todo.completed;
      }),
    [todos, filter],
  );
  const active = todos.filter((todo) => !todo.completed).length;
  const completed = todos.length - active;
  const save = async (title: string, isComplete: boolean) => {
    const updated =
      dialog === 'new'
        ? await todoApi.create(title)
        : await todoApi.update(dialog!.id, title, isComplete);
    setTodos((old) =>
      dialog === 'new'
        ? [updated, ...old]
        : old.map((todo) => (todo.id === updated.id ? updated : todo)),
    );
    setFeedback(dialog === 'new' ? 'Task created.' : 'Task updated.');
  };
  const toggle = async (todo: Todo) => {
    setPendingId(todo.id);
    setError('');
    try {
      const updated = await todoApi.update(todo.id, todo.title, !todo.completed);
      setTodos((old) => old.map((item) => (item.id === todo.id ? updated : item)));
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setPendingId(null);
    }
  };
  const remove = async (todo: Todo) => {
    if (!window.confirm(`Delete “${todo.title}”? This cannot be undone.`)) return;
    setPendingId(todo.id);
    try {
      await todoApi.remove(todo.id);
      setTodos((old) => old.filter((item) => item.id !== todo.id));
      setFeedback('Task deleted.');
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setPendingId(null);
    }
  };
  return (
    <main>
      <header>
        <a className="brand" href="/todos">
          <span className="brand-mark">✓</span>
          <span>Taskly</span>
        </a>
        <div className="account">
          <span>{user?.email}</span>
          <button
            className="text-button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <section className="dashboard">
        <div className="hero">
          <div>
            <p className="eyebrow">YOUR DASHBOARD</p>
            <h1>My tasks</h1>
            <p className="subtle">
              {active === 1 ? '1 task remaining' : `${active} tasks remaining`} · {completed}{' '}
              complete
            </p>
          </div>
          <button className="primary" onClick={() => setDialog('new')}>
            + Add task
          </button>
        </div>
        {feedback && (
          <p className="notice success" role="status">
            {feedback}
          </p>
        )}
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <div className="filters" aria-label="Filter tasks">
          {(['all', 'active', 'completed'] as const).map((option) => (
            <button
              key={option}
              className={filter === option ? 'filter active' : 'filter'}
              onClick={() => setFilter(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="loading-panel">
            <Spinner /> Loading your tasks…
          </div>
        ) : visible.length ? (
          <ul className="todo-list">
            {visible.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'todo done' : 'todo'}>
                <input
                  aria-label={`Mark ${todo.title} as ${todo.completed ? 'active' : 'complete'}`}
                  type="checkbox"
                  checked={Boolean(todo.completed)}
                  onChange={() => void toggle(todo)}
                  disabled={pendingId === todo.id}
                />
                <div className="todo-title">
                  <strong>{todo.title}</strong>
                  <small>{todo.completed ? 'Completed' : 'In progress'}</small>
                </div>
                <div className="todo-actions">
                  <button
                    className="text-button"
                    onClick={() => setDialog({ ...todo })}
                    disabled={pendingId === todo.id}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => void remove(todo)}
                    disabled={pendingId === todo.id}
                  >
                    {pendingId === todo.id ? <Spinner /> : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <section className="empty">
            <span>☀</span>
            <h2>{filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}</h2>
            <p>
              {filter === 'all'
                ? 'Create your first task and start getting things done.'
                : 'Try another filter or add a new task.'}
            </p>
            {filter === 'all' && (
              <button className="primary" onClick={() => setDialog('new')}>
                + Create task
              </button>
            )}
          </section>
        )}
      </section>
      {dialog && (
        <TodoDialog
          todo={dialog === 'new' ? undefined : dialog}
          onClose={() => setDialog(null)}
          onSave={save}
        />
      )}
    </main>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <main className="auth-shell">
        <Spinner />
      </main>
    );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
export function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route
        path="/todos"
        element={
          <Protected>
            <TodosPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/todos" replace />} />
    </Routes>
  );
}
