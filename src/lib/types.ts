export interface SubTodo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  date: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  date: string;
  subtodos: SubTodo[];
}
