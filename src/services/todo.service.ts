import * as repository from '../repositories/todo.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { TodoQuery } from '../dtos/todo.dto.js';

const isOwner = (todoUserId: string, requesterId: string, requesterRole: string) => {
  return todoUserId === requesterId || requesterRole === 'admin';
};

export const getAllTodos = async (query?: TodoQuery) => {
  const todo = await repository.findAll(query);
  return todo;
};

export const getTodoById = async (id: string, requesterId: string, requesterRole: string) => {
  const todo = await repository.findById(id);

  if (!todo) {
    return null;
  }
  if (!isOwner(todo.userId, requesterId, requesterRole)) {
    return { error: 'FORBIDDEN' };
  }
  return todo;
};

export const createTodo = async (title: string, userId: string) => {
  if (!title || title.trim() === '') {
    return { error: 'MISSING_TITLE' };
  }

  if (!userId || userId.trim() === '') {
    return { error: 'MISSING_USER_ID' };
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }

  return await repository.insert(title, userId);
};

export const updateTodo = async (id: string, title: string, completed: boolean) => {
  return await repository.update(id, title, completed);
};

export const deleteTodo = async (id: string, requesterId: string, requesterRole: string) => {
  const exist = await repository.findById(id);

  if (!exist) {
    return null;
  }

  if (!isOwner(exist.userId, requesterId, requesterRole)) {
    return { error: 'FORBIDDEN' };
  }

  await repository.remove(id);
  return { success: true };
};
