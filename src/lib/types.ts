export interface SubTodo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  startDate: string;
  endDate: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  startDate: string;
  endDate: string;
  subtodos: SubTodo[];
}
