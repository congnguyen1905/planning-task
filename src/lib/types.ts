export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: number;
}

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
  projectId?: string;
  text: string;
  done: boolean;
  createdAt: number;
  startDate: string;
  endDate: string;
  subtodos: SubTodo[];
}

