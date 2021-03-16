const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({
      error: 'User not found!'
    })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username);

  if(userExists){
    return response.status(400).json({
      error: 'User already exists.'
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(task)

  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const { title, deadline } = request.body;

  const taskIndex = user.todos.findIndex(task => task.id === id);

  if(taskIndex < 0){
    return response.status(404).json({
      error: 'Task not found!'
    })
  }

  const updatedTodo = {
    id: uuidv4(),
    done: false,
    title,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos[taskIndex] = updatedTodo;

  return response.json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const taskIndex = user.todos.findIndex(task => task.id === id);

  if(taskIndex < 0){
    return response.status(404).json({
      error: 'Task not found!'
    })
  }

  const todo = {
    ...user.todos[taskIndex],
    done: true
  }

  user.todos[taskIndex] = todo;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const taskExists = user.todos.findIndex(task => task.id === id);

  if(taskExists < 0){
    return response.status(404).json({
      error: 'Task not found!'
    })
  }

  user.todos.splice(taskExists, 1);

  return response.status(204).send();
});

module.exports = app;