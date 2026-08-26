import * as todoService from '../../services/todo.service.js';

const DEMO_USER = {
  id: '8ec8cce9-88bd-4c28-80aa-6f4daf5d4741',
  role: 'user',
};

interface DeleteTodoToolArgs {
  id?: string;
}

export async function deleteTodoTool(args?: DeleteTodoToolArgs) {
  const result = await todoService.deleteTodo(args?.id ?? '', DEMO_USER.id, DEMO_USER.role);

  if (!result) {
    return {
      content: [
        {
          type: 'text',
          text: 'Todo not found',
        },
      ],
    };
  }

  if ('error' in result) {
    return {
      content: [
        {
          type: 'text',
          text: 'Forbidden: you cannot delete this todo',
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: 'Todo deleted successfully',
      },
    ],
  };
}
