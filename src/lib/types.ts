export interface SubTodo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  subtodos: SubTodo[];
}
