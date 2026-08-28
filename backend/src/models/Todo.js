import { Schema, model } from 'mongoose';

const TodoSchema = new Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date, default: null },
  order: { type: Number, default: 0 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Todo = model('Todo', TodoSchema);
