const jsonServer = require('json-server');
const isDevelopment = process.env?.NODE_ENV === 'development';

const path = require('path')
const server = jsonServer.create();
const dbJsonPath = isDevelopment 
? './json-server/db.json' 
: path.join('..','controller', 'json-server', 'db.json')
const router = jsonServer.router(dbJsonPath);

const middlewares = jsonServer.defaults();

// Use default middlewares (CORS, static, etc.)
server.use(middlewares);

// Use router
server.use(router);

// Start server
const port = 3004;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});