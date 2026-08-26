import { TodoQuery } from '../dtos/todo.dto.js';
import { ParsedQs } from 'qs';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_LIMIT = 100;
const VALID_SORT_BY = ['createdAt', 'title', 'completed', 'updatedAt'];
const VALID_ORDER_BY = ['asc', 'desc'];

type QueryValue = string | boolean | ParsedQs | (string | ParsedQs)[] | undefined;
type QueryParams = Record<string, QueryValue>;

const firstValue = (value: QueryValue): string | boolean | undefined => {
  const scalar = Array.isArray(value) ? value[0] : value;
  return typeof scalar === 'string' || typeof scalar === 'boolean' ? scalar : undefined;
};

export const parseQueryParams = (query: QueryParams): TodoQuery => {
  const pageValue = firstValue(query.page);
  const limitValue = firstValue(query.limit);
  const sortByValue = firstValue(query.sortBy);
  const orderValue = firstValue(query.order);
  const completedValue = firstValue(query.completed);
  const titleValue = firstValue(query.title);

  let page = Number.parseInt(String(pageValue), 10) || DEFAULT_PAGE;
  let limit = Number.parseInt(String(limitValue), 10) || DEFAULT_LIMIT;

  if (page < 1) page = DEFAULT_PAGE;

  if (limit < 1) limit = DEFAULT_LIMIT;

  if (limit > DEFAULT_MAX_LIMIT) limit = DEFAULT_MAX_LIMIT;

  let sortBy: 'createdAt' | 'title' | 'completed' | 'updatedAt' = 'createdAt';
  if (typeof sortByValue === 'string' && VALID_SORT_BY.includes(sortByValue)) {
    sortBy = sortByValue as typeof sortBy;
  }

  let order: 'asc' | 'desc' = 'asc';
  if (typeof orderValue === 'string' && VALID_ORDER_BY.includes(orderValue.toLowerCase())) {
    order = orderValue.toLowerCase() as typeof order;
  }

  let completed: boolean | undefined;
  if (completedValue === 'true' || completedValue === true) {
    completed = true;
  } else if (completedValue === 'false' || completedValue === false) {
    completed = false;
  }

  let title: string | undefined;
  if (typeof titleValue === 'string' && titleValue.trim()) {
    title = titleValue.trim();
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
