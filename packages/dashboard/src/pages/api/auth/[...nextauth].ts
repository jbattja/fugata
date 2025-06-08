import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { settingsClient } from '../../../lib/api/clients';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await settingsClient.findByUsername(credentials.username);
          if (!user) {
            return null;
          }

          const isValid = await settingsClient.validatePassword(
            credentials.username,
            credentials.password
          );

          if (!isValid) {
            return null;
          }
          return user;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {      
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.merchantIds = user.merchantIds;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          username: token.username as string,
          email: token.email as string,
          merchantIds: token.merchantIds as string[],
          role: token.role as 'admin' | 'user',
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  debug: true,
}); 