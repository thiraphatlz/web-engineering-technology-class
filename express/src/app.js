import express from 'express';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { createApolloServer } from './graphql/index.js';
import bookRoutes from './routes/book.routes.js';
import fileRoutes from './routes/file.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// สร้างและเริ่มต้น Apollo GraphQL Server
const apolloServer = createApolloServer();
await apolloServer.start();

// Middleware สำหรับ CORS และการ Parse JSON Request Body
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. GraphQL Endpoint: รองรับทั้ง GraphQL Queries / Mutations และมี Apollo Sandbox GUI
app.use('/graphql', expressMiddleware(apolloServer));

// 2. RESTful API Routing: รองรับ CRUD และ Multipart File Upload
app.use('/api/books', bookRoutes);
app.use('/api/files', fileRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Express Hybrid API (RESTful + GraphQL) with Secure File Handling is running',
    endpoints: {
      restBooks: '/api/books',
      restFiles: '/api/files/:filename',
      graphql: '/graphql',
    },
  });
});

// Global Error Handler สำหรับ REST API
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express server is running on http://localhost:${PORT}`);
  console.log(`📊 RESTful Books API:  http://localhost:${PORT}/api/books`);
  console.log(`📁 RESTful Files API:  http://localhost:${PORT}/api/files`);
  console.log(`🧭 GraphQL Endpoint:   http://localhost:${PORT}/graphql`);
});

export default app;
