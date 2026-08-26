export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
