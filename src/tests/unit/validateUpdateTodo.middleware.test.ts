import { describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import { validateUpdateTodo } from '../../middleware/validateUpdateTodo.middleware.js';

const mockRes = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('validateUpdateTodo middleware', () => {
  it('should return 400 when title is missing', () => {
    const req = { body: { completed: true } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateUpdateTodo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 when completed is missing', () => {
    const req = { body: { title: 'Clean Room' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateUpdateTodo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 when title is an empty string', () => {
    const req = { body: { title: '   ', completed: true } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateUpdateTodo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 when completed is not a boolean', () => {
    const req = { body: { title: 'Clean Room', completed: 'yes' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateUpdateTodo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when title and completed are valid', () => {
    const req = { body: { title: 'Clean Room', completed: true } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateUpdateTodo(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
