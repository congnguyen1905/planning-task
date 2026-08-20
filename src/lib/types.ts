export interface Project {
  id: string;
  name: string;
  username?: string;
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

export interface Account {
  id: number;
  fullname: string;
  username: string;
  password?: string;
  color: "coral" | "blue" | "gold" | "mint";
}

export interface Todo {
  id: string;
  projectId?: string;
  username?: string;
  text: string;
  done: boolean;
  createdAt: number;
  startDate: string;
  endDate: string;
  subtodos: SubTodo[];
}

