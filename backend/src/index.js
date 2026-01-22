import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import cors from 'cors';

const app = express();

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todolist';

app.use(
  cors({
    origin: ['https://docker-task-list.vercel.app', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'userid'],
  }),
);
app.use(json());

connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to Mongo:', err));

const TodoSchema = new Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true },
});

const Todo = model('Todo', TodoSchema);

app.get('/todos', async (req, res) => {
  try {
    const { userid } = req.headers;
    if (!userid) return res.status(400).json({ error: 'UserId header is missing' });

    const todos = await Todo.find({ userId: userid });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const { text } = req.body;
    const { userid } = req.headers;

    if (!text || !userid) {
      return res.status(400).json({ error: 'Text and UserId are required' });
    }

    const newTodo = new Todo({
      text,
      userId: userid,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error saving task' });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Task not found' });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Error updating task status' });
  }
});

app.patch('/todos/:id', async (req, res) => {
  try {
    const { text } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, { text }, { new: true });

    if (!updatedTodo) return res.status(404).json({ message: 'Task not found' });
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Error editing task text' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Deleted task successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
