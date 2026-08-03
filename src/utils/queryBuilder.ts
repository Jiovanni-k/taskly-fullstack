import { TodoQuery } from '../dtos/todo.dto.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_LIMIT = 100;
const VALID_SORT_BY = ['createdAt', 'title', 'completed', 'updatedAt'];
const VALID_ORDER_BY = ['asc', 'desc'];

export const parseQueryParams = (query: any): TodoQuery => {
  let page = parseInt(query.page) || DEFAULT_PAGE;
  let limit = parseInt(query.limit) || DEFAULT_LIMIT;

  if (page < 1) page = DEFAULT_PAGE;

  if (limit < 1) limit = DEFAULT_LIMIT;

  if (limit > DEFAULT_MAX_LIMIT) limit = DEFAULT_MAX_LIMIT;

  let sortBy: 'createdAt' | 'title' | 'completed' | 'updatedAt' = 'createdAt';
  if (query.sortBy && VALID_SORT_BY.includes(query.sortBy)) sortBy = query.sortBy;

  let order: 'asc' | 'desc' = 'asc';
  if (query.order && VALID_ORDER_BY.includes(query.order.toLowerCase())) {
    order = query.order.toLowerCase();
  }

  let completed: boolean | undefined;
  if (query.completed !== undefined) {
    completed = query.completed === 'true' || query.completed === true;
  }

  let title: string | undefined;
  if (query.title && typeof query.title === 'string' && query.title.trim()) {
    title = query.title.trim();
  }

  return {
    page,
    limit,
    sortBy,
    order,
    completed,
    title,
  };
};
