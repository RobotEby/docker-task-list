import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todolist';
const JWT_SECRET =
  process.env.JWT_SECRET || '0CZakfz7dsxtRhkEoqTrF0hI3AB2610aVD+iVSzhJzroiDWBpgRQHbFqk8d4faza';

app.use(
  cors({
    origin: [
      'https://docker-task-list.vercel.app',
      'http://localhost:8080',
      'http://127.0.0.1:8080',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
app.use(json());

connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to Mongo:', err));

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TodoSchema = new Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = model('User', UserSchema);
const Todo = model('Todo', TodoSchema);

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Nenhum token fornecido' });
    }

    const parts = authHeader.split(/\s+/);
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Erro no formato do token' });
    }

    const token = parts[1].trim();
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (err) {
    console.error('Erro JWT:', err.message);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'É necessário fornecer um e-mail e uma senha' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'É necessário fornecer um e-mail e uma senha' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const expiresIn = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn });

    res.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  res.json({ user: { id: req.user._id, email: req.user.email } });
});

app.get('/todos', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});

app.post('/todos', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'O texto é obrigatório' });
    }

    const newTodo = new Todo({
      text,
      userId: req.userId,
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar a tarefa' });
  }
});

app.put('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId });
    if (!todo) return res.status(404).json({ message: 'Tarefa não encontrada' });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar o status da tarefa' });
  }
});

app.patch('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { text },
      { new: true },
    );

    if (!updatedTodo) return res.status(404).json({ message: 'Tarefa não encontrada' });
    res.json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao editar o texto da tarefa' });
  }
});

app.delete('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!deletedTodo) return res.status(404).json({ message: 'Tarefa não encontrada' });
    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir tarefa' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
