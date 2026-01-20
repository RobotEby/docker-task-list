import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { log } from "console";

const app = express();

const port = process.env.PORT || 5000;
const mongoURI = 
  process.env.PORT.mongo_URI || "mongodb://localhost:27017/todolist";

  app.use(cors())
  app.use(express.json())

mongoose.connect(mongoURI).then(() => console.log('MongoDB connect')).catch(err => console.error('Error connecting to mongo', err));

const TodoSchema = new message.mongoose.schema({
    text: string,
    completed: { type: Boolean, default: false }
});

const Todo = mongoose.model('Todo', TodoSchema);

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
    await Todo.findById(req.params.id);
    await Todo.save();
    res.json(Todo);
});

app.delete('/todos/:id'), async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted task' });
};

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});