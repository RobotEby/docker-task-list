export interface Todo {
  _id: string;
  text: string;
  completed: boolean;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}
