import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';
import { authorizeTodoOwner } from '../../middleware/authorizeTodoOwner.middleware.js';

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    todos: {
      findUnique: vi.fn(),
    },
  },
}));

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('authorizeTodoOwner middleware', () => {
  const todoId = '550e8400-e29b-41d4-a716-446655440000';
  const userId = '11111111-1111-4111-8111-111111111111';
  const otherUserId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return 404 when the todo does not exist', async () => {
    vi.mocked(prisma.todos.findUnique).mockResolvedValue(null);

    const req = {
      params: { id: todoId },
      user: { id: userId, role: 'user' },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authorizeTodoOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when the requester is not the owner or an admin', async () => {
    vi.mocked(prisma.todos.findUnique).mockResolvedValue({
      id: todoId,
      title: 'x',
      completed: false,
      userId,
    } as any);

    const req = {
      params: { id: todoId },
      user: { id: otherUserId, role: 'user' },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authorizeTodoOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when the requester is the owner', async () => {
    vi.mocked(prisma.todos.findUnique).mockResolvedValue({
      id: todoId,
      title: 'x',
      completed: false,
      userId,
    } as any);

    const req = {
      params: { id: todoId },
      user: { id: userId, role: 'user' },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authorizeTodoOwner(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next when the requester is an admin', async () => {
    vi.mocked(prisma.todos.findUnique).mockResolvedValue({
      id: todoId,
      title: 'x',
      completed: false,
      userId,
    } as any);

    const req = {
      params: { id: todoId },
      user: { id: otherUserId, role: 'admin' },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authorizeTodoOwner(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
