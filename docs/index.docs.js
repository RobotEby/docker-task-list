import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import cors from 'cors';

const app = express();

/* Docker will pass the port and Mongo URI via environment variables. */
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todolist';

/* Middlewares */
app.use(cors()); /* Allow React (port 5173) to access Node (port 5000) */
app.use(json());

/* Connection to the Database */
connect(mongoURI)
  .then(() => console.log('Connected MongoDB'))
  .catch((err) => console.error('Error connecting to Mongo:', err));

/* Task Model (Schema) */
const TodoSchema = new Schema({
  text: String,
  completed: { type: Boolean, default: false },
});

/* --- ROUTES --- */

const Todo = model('Todo', TodoSchema);

/* 1. List all tasks */
app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

/* 2. Create task */
app.post('/todos', async (req, res) => {
  const newTodo = new Todo({ text: req.body.text });
  await newTodo.save();
  res.json(newTodo);
});

/* 3. Update (Complete/clear) */
app.put('/todos/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  todo.completed = !todo.completed;
  await todo.save();
  res.json(todo);
});

/* 4. Delete */
app.delete('/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted task' });
});

app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
