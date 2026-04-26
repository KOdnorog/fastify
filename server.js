const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const fastify = require('fastify')({ logger: true });
const fastifyStatic = require('@fastify/static');
const fastifyView = require('@fastify/view');
const fastifyFormbody = require('@fastify/formbody');
const pug = require('pug');

const db = new DatabaseSync('users.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  )
`);

const countUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();

if (countUsers.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');

  insertUser.run('Иван Иванов', 'ivan@example.com');
  insertUser.run('Мария Петрова', 'maria@example.com');
  insertUser.run('Алексей Сидоров', 'alexey@example.com');
}

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

fastify.register(fastifyView, {
  engine: { pug },
  root: path.join(__dirname, 'views'),
});

fastify.register(fastifyFormbody);

fastify.get('/', (request, reply) => {
  return reply.redirect('/users');
});

fastify.get('/users', (request, reply) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id').all();

  return reply.view('users.pug', { users });
});

fastify.get('/users/create', (request, reply) => {
  return reply.view('create-user.pug');
});

fastify.post('/users', (request, reply) => {
  const { name, email } = request.body;

  db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);

  return reply.redirect('/users');
});

fastify.get('/users/:id/edit', (request, reply) => {
  const { id } = request.params;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

  if (!user) {
    return reply.code(404).send('Пользователь не найден');
  }

  return reply.view('edit-user.pug', { user });
});

fastify.post('/users/:id/edit', (request, reply) => {
  const { id } = request.params;
  const { name, email } = request.body;

  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);

  return reply.redirect('/users');
});

fastify.post('/users/:id/delete', (request, reply) => {
  const { id } = request.params;

  db.prepare('DELETE FROM users WHERE id = ?').run(id);

  return reply.redirect('/users');
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Сервер запущен на http://localhost:3000/users');
});
