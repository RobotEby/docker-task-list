export interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  order?: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}
