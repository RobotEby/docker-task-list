import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import cors from 'cors';

const app = express();

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todolist';

app.use(cors());
app.use(json());

connect(mongoURI)
  .then(() => console.log('Connected MongoDB'))
  .catch((err) => console.error('Error connecting to Mongo:', err));

const TodoSchema = new Schema({
  text: String,
  completed: { type: Boolean, default: false },
});

const Todo = model('Todo', TodoSchema);

app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/todos', async (req, res) => {
  const newTodo = new Todo({ text: req.body.text });
  await newTodo.save();
  res.json(newTodo);
});

app.put('/todos/:id', async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  todo.completed = !todo.completed;
  await todo.save();
  res.json(todo);
});

app.delete('/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted task' });
});

app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});

app.patch('/todos/:id', async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true },
    );
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error editing task' });
  }
});
