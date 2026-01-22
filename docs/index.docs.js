/* Import Express and JSON middleware helper from express */
import express, { json } from 'express';
/* Import Mongoose connect function, Schema and model helpers */
import { connect, Schema, model } from 'mongoose';
/* Import CORS middleware to configure cross-origin access */
import cors from 'cors';

/* Create an Express application instance */
const app = express();

/* Port where server will listen (from env or fallback to 5000) */
const port = process.env.PORT || 5000;
/* MongoDB connection URI (from env or fallback to local database) */
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todolist';

/*
  Configure CORS middleware:
  - allow origins used by the front-end(s)
  - allow common HTTP methods
  - enable credentials
  - restrict allowed headers to 'Content-Type' and a custom 'userid'
*/
app.use(
  cors({
    origin: ['https://docker-task-list.vercel.app', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'userid'],
  }),
);
/* Enable parsing of incoming JSON request bodies */
app.use(json());

/* Connect to MongoDB using Mongoose and log success or error */
connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to Mongo:', err));

/*
  Define the Todo schema:
  - text: the task description (required)
  - completed: boolean flag (default false)
  - userId: string that associates the todo with a user (required)
*/
const TodoSchema = new Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true },
});

/* Create a Mongoose model named 'Todo' from the schema */
const Todo = model('Todo', TodoSchema);

/*
  GET /todos
  - Requires 'userid' header
  - Returns all todos belonging to the provided userId
  - Responds with 400 when header is missing, 500 on server/database errors
*/
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

/*
  POST /todos
  - Creates a new todo document
  - Expects JSON body with 'text' and a 'userid' header
  - Returns 201 with the created todo, 400 for missing fields, 500 on error
*/
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

/*
  PUT /todos/:id
  - Toggles the 'completed' status of the todo with the given id
  - Returns 404 if the todo is not found, 500 on server/database errors
*/
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

/*
  PATCH /todos/:id
  - Updates the 'text' field of an existing todo
  - Uses findByIdAndUpdate with { new: true } to return the updated document
  - Returns 404 if not found, 500 on error
*/
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

/*
  DELETE /todos/:id
  - Deletes the todo with the specified id
  - Returns 404 if not found, 500 on server/database errors
*/
app.delete('/todos/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Deleted task successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

/* Start the Express server and log the listening port */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
