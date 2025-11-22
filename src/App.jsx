import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check, Bell, Clock } from 'lucide-react';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [notifiedTasks, setNotifiedTasks] = useState(new Set());

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      checkReminders();
    }, 60000);

    checkReminders();

    return () => clearInterval(interval);
  }, [todos, notifiedTasks]);

  const checkReminders = () => {
    const now = new Date();
    const newNotified = new Set(notifiedTasks);

    todos.forEach(todo => {
      if (!todo.reminderDateTime || todo.completed) return;

      const reminderDate = new Date(todo.reminderDateTime);
      const timeDiff = reminderDate - now;
      const oneHour = 60 * 60 * 1000;

      const morningReminder = new Date(reminderDate);
      morningReminder.setHours(9, 0, 0, 0);
      const morningKey = `${todo.id}-morning`;

      if (now >= morningReminder && now < new Date(morningReminder.getTime() + 60000) && !newNotified.has(morningKey)) {
        showNotification(`Morning Reminder: ${todo.text}`, `Task scheduled for ${reminderDate.toLocaleString()}`);
        newNotified.add(morningKey);
      }

      const oneHourKey = `${todo.id}-1hour`;
      if (timeDiff > 0 && timeDiff <= oneHour && timeDiff > (oneHour - 60000) && !newNotified.has(oneHourKey)) {
        showNotification(`1 Hour Reminder: ${todo.text}`, `Task due at ${reminderDate.toLocaleTimeString()}`);
        newNotified.add(oneHourKey);
      }
    });

    setNotifiedTasks(newNotified);
  };

  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '⏰' });
    } else {
      alert(`${title}\n${body}`);
    }
  };

  const addTodo = () => {
    if (input.trim()) {
      let reminderDateTime = null;
      if (reminderDate && reminderTime) {
        reminderDateTime = `${reminderDate}T${reminderTime}`;
      }

      setTodos([...todos, { 
        id: Date.now(), 
        text: input, 
        completed: false,
        reminderDateTime 
      }]);
      setInput('');
      setReminderDate('');
      setReminderTime('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addTodo();
  };

  const formatReminder = (dateTime) => {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            ✨ My To-Do List
          </h1>
          
          <div className="mb-6 space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new task..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition"
            />
            
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm"
                />
              </div>
              <button
                onClick={addTodo}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Bell size={12} /> Set reminder to get notified 1hr before & at 9 AM on task day
            </p>
          </div>

          <div className="space-y-2">
            {todos.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No tasks yet. Add one above! 🎯
              </p>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition mt-1 ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-purple-500'
                    }`}
                  >
                    {todo.completed && <Check size={16} className="text-white" />}
                  </button>
                  
                  <div className="flex-1">
                    <span
                      className={`block transition ${
                        todo.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-800'
                      }`}
                    >
                      {todo.text}
                    </span>
                    {todo.reminderDateTime && (
                      <span className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {formatReminder(todo.reminderDateTime)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition flex-shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {todos.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              {todos.filter(t => !t.completed).length} task(s) remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
}