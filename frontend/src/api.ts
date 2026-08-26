import type { AuthResponse, Todo, User } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';
const tokenKey = 'taskly-token';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const getErrorMessage = (status: number, body: unknown) => {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }
  if (status >= 500) return 'Something went wrong. Please try again.';
  return 'We could not complete that request. Please try again.';
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(tokenKey);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const body: unknown =
      response.status === 204 ? undefined : await response.json().catch(() => undefined);
    if (!response.ok) {
      if (response.status === 401) window.dispatchEvent(new Event('auth:expired'));
      throw new ApiError(response.status, getErrorMessage(response.status, body));
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
  }
}

export const authApi = {
  register: (email: string, password: string) =>
    request<Pick<User, 'id' | 'email'>>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: User }>('/users/me'),
};

type TodoList = Todo[] | { data: Todo[] };
export const todoApi = {
  list: async () => {
    const result = await request<TodoList>('/todos');
    return Array.isArray(result) ? result : result.data;
  },
  create: (title: string) =>
    request<Todo>('/todos', { method: 'POST', body: JSON.stringify({ title }) }),
  update: (id: string, title: string, completed: boolean) =>
    request<Todo>(`/todos/${id}`, { method: 'PUT', body: JSON.stringify({ title, completed }) }),
  remove: (id: string) => request<void>(`/todos/${id}`, { method: 'DELETE' }),
};

export const session = {
  tokenKey,
  save: (token: string) => localStorage.setItem(tokenKey, token),
  clear: () => localStorage.removeItem(tokenKey),
};
