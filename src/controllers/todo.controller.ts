import { Request, Response } from 'express';
import * as service from '../services/todo.service.js';
import { parseQueryParams } from '../utils/queryBuilder.js';

export const getTodos = async (req: Request, res: Response) => {
  try {
    const hasQueryParams = Object.keys(req.query).length > 0;
    const query = hasQueryParams ? parseQueryParams(req.query) : undefined;
    const todo = await service.getAllTodos(query);

    if (query && 'todos' in todo) {
      const { todos, total } = todo;
      const pages = Math.ceil(total / query.limit);
      return res.status(200).json({
        data: todos,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages,
        },
      });
    }
    return res.status(200).json(todo);
  } catch (_error) {
    console.error(_error);
    return res.status(500).json({
      message: 'Error displaying todos.',
    });
  }
};

export const createTodos = async (req: Request, res: Response) => {
  const { title } = req.body;

  try {
    const todo = await service.createTodo(title, req.user!.id);

    if (todo && 'error' in todo) {
      if (todo.error === 'USER_NOT_FOUND') {
        return res.status(404).json({
          message: 'User Not Found',
        });
      }

      return res.status(400).json({
        message: 'Title and userId are required.',
      });
    }
    return res.status(201).json(todo);
  } catch (_error) {
    console.error(_error);
    return res.status(500).json({
      message: 'Error creating todo.',
    });
  }
};

export const getTodoById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const todo = await service.getTodoById(id, req.user!.id, req.user!.role);

    if (!todo) {
      return res.status(404).json({
        message: 'Todo Not Found :(',
      });
    }
    if ('error' in todo) {
      return res.status(403).json({
        message: 'Forbidden. You do not have permission to access this todo.',
      });
    }
    return res.status(200).json(todo);
  } catch (_error) {
    console.error(_error);
    return res.status(500).json({
      message: 'Error displaying todo.',
    });
  }
};

export const updateTodo = async (req: Request, res: Response) => {
  const { title, completed } = req.body;

  const id = String(req.params.id);

  try {
    const todo = await service.updateTodo(id, title, completed);
    return res.status(200).json(todo);
  } catch (_error) {
    console.error(_error);
    return res.status(500).json({
      message: 'Error Updating the todo.',
    });
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const todo = await service.deleteTodo(id, req.user!.id, req.user!.role);

    if (!todo) {
      return res.status(404).json({
        message: 'Todo Not Found:(',
      });
    }
    if ('error' in todo) {
      return res.status(403).json({
        message: 'Forbidden. You do not have permission to delete this todo.',
      });
    }

    return res.status(204).send();
  } catch (_error) {
    console.error(_error);
    return res.status(500).json({
      message: 'Error Deleting the Todo.',
    });
  }
};
