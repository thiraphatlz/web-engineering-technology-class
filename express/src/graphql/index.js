import { ApolloServer } from '@apollo/server';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';

/**
 * สร้าง Apollo Server instance สำหรับ Express
 */
export const createApolloServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    // เปิดการแสดง Error รายละเอียดสำหรับการพัฒนา
    formatError: (formattedError, error) => {
      console.error('GraphQL Error:', error);
      return formattedError;
    },
  });
};
