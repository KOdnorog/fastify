const path = require('path');
const fastify = require('fastify')({ logger: true });
const fastifyStatic = require('@fastify/static');
const fastifyView = require('@fastify/view');
const fastifyFormbody = require('@fastify/formbody');
const pug = require('pug');

const users = [
  { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
  { id: 2, name: 'Мария Петрова', email: 'maria@example.com' },
  { id: 3, name: 'Алексей Сидоров', email: 'alexey@example.com' }
];

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/'
});

fastify.register(fastifyView, {
  engine: { pug },
  root: path.join(__dirname, 'views')
});

fastify.register(fastifyFormbody);

fastify.get('/users', (request, reply) => {
  reply.view('users.pug', { users });
});

fastify.get('/users/create', (request, reply) => {
  reply.view('create-user.pug');
});

fastify.post('/users', (request, reply) => {
  const name = request.body.name;
  const email = request.body.email;

  const newUser = {
    id: users.length + 1,
    name: name,
    email: email
  };

  users.push(newUser);
  reply.redirect('/users');
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Сервер запущен на http://localhost:3000/users');
});
