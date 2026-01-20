import { useState, useEffect } from 'react';

/* Get the URL defined in docker-compose or use localhost as a fallback */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  /* Load tasks on startup */
  useEffect(() => {
    fetch(`${API_URL}/todos`)
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error('Erro ao buscar tarefas:', err));
  }, []);

  /* Add task */
  const addTodo = async (e) => {
    e.preventDefault();
    if (!text) return;

    const res = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setText('');
  };

  /* Switch status (complete) */
  const toggleTodo = async (id) => {
    const res = await fetch(`${API_URL}/todos/${id}`, { method: 'PUT' });
    const updatedTodo = await res.json();
    setTodos(todos.map((t) => (t._id === id ? updatedTodo : t)));
  };

  /* Delete task */
  const deleteTodo = async (id) => {
    await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    setTodos(todos.filter((t) => t._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">Docker Todo-List 🐋</h1>

        {/* Form */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Nova tarefa..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold transition"
          >
            +
          </button>
        </form>

        {/* List */}
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className="flex justify-between items-center bg-gray-700 p-3 rounded group"
            >
              <span
                onClick={() => toggleTodo(todo._id)}
                className={`cursor-pointer select-none flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo._id)}
                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
