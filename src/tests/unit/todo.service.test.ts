import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as service from '../../services/todo.service.js';
import { parseQueryParams } from '../../utils/queryBuilder.js';
import { prisma } from '../../config/prisma.js';
// Only tests the methods in the service layer.

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    todos: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Todo list Service testing', () => {
  const todoId = '550e8400-e29b-41d4-a716-446655440000'; //random UUID for testing purposes
  const userId = '11111111-1111-4111-8111-111111111111';
  const otherUserId = '22222222-2222-4222-8222-222222222222';
  const todoTimestamps = {
    createdAt: new Date('2026-07-09T00:00:00.000Z'),
    updatedAt: new Date('2026-07-09T00:00:00.000Z'),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return error when title is empty', async () => {
    await expect(service.createTodo('', userId)).resolves.toEqual({ error: 'MISSING_TITLE' });
  });

  it('should create todo', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      email: 'test@gmail.com',
      password: 'hashed',
      role: 'user',
    });
    vi.mocked(prisma.todos.create).mockResolvedValue({
      id: todoId,
      title: 'Clean Room',
      completed: false,
      userId: userId,
      ...todoTimestamps,
    });
    const result = await service.createTodo('Clean Room', userId);
    if ('error' in result) {
      throw new Error(`Expected todo, received ${result.error}`);
    }
    expect(result.title).toBe('Clean Room');
  });

  it('should return every todo regardless of who is asking (public route)', async () => {
    vi.mocked(prisma.todos.findMany).mockResolvedValue([
      { id: todoId, title: 'mine', completed: false, userId: userId, ...todoTimestamps },
      {
        id: 'other-id',
        title: 'not mine',
        completed: false,
        userId: otherUserId,
        ...todoTimestamps,
      },
    ]);

    const result = await service.getAllTodos();
    expect(prisma.todos.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it('should update the todo via the repository', async () => {
    vi.mocked(prisma.todos.update).mockResolvedValue({
      id: todoId,
      title: 'new title',
      completed: true,
      userId: userId,
      ...todoTimestamps,
    });

    const result = await service.updateTodo(todoId, 'new title', true);

    expect(prisma.todos.update).toHaveBeenCalledWith({
      where: { id: todoId },
      data: { title: 'new title', completed: true },
    });
    expect(result).toMatchObject({
      id: todoId,
      title: 'new title',
      completed: true,
      userId: userId,
    });
  });

  it("should return FORBIDDEN when a non-owner, non-admin tries to view someone else's todo", async () => {
    vi.mocked(prisma.todos.findUnique).mockResolvedValue({
      id: todoId,
      title: 'old title',
      completed: false,
      userId: userId,
      ...todoTimestamps,
    });

    const result = await service.getTodoById(todoId, otherUserId, 'user');
    expect(result).toEqual({ error: 'FORBIDDEN' });
  });

  it('should return FORBIDDEN when a non-owner, non-admin tries to delete', async () => {
    vi.mocked(prisma.todos.findUnique).mockResolvedValue({
      id: todoId,
      title: 'old title',
      completed: false,
      userId: userId,
      ...todoTimestamps,
    });

    const result = await service.deleteTodo(todoId, otherUserId, 'user');
    expect(result).toEqual({ error: 'FORBIDDEN' });
  });
});

describe('parseQueryParams', () => {
  it('should default sortBy to createdAt when not provided', () => {
    const result = parseQueryParams({});
    expect(result.sortBy).toBe('createdAt');
  });

  it('should accept updatedAt as a valid sortBy value', () => {
    const result = parseQueryParams({ sortBy: 'updatedAt' });
    expect(result.sortBy).toBe('updatedAt');
  });

  it('should fall back to createdAt for an invalid sortBy value', () => {
    const result = parseQueryParams({ sortBy: 'notARealField' });
    expect(result.sortBy).toBe('createdAt');
  });

  it('should default order to asc when not provided', () => {
    const result = parseQueryParams({});
    expect(result.order).toBe('asc');
  });

  it('should accept desc as a valid order value', () => {
    const result = parseQueryParams({ order: 'desc' });
    expect(result.order).toBe('desc');
  });
});
