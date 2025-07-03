import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { settingsClient } from '../../../lib/api/clients';
import { jwtService } from '../../../lib/auth/jwt.service';

export const authOptions: NextAuthOptions = {
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
          const sharedUser = await settingsClient.findByUsername(await jwtService.getAuthHeadersForServiceAccount(), credentials.username);
          if (!sharedUser) {
            return null;
          }

          const isValid = await settingsClient.validatePassword(await jwtService.getAuthHeadersForServiceAccount(),
            credentials.username,
            credentials.password
          );

          if (!isValid) {
            return null;
          }

          // Map shared User to NextAuth User type
          return {
            id: sharedUser.id || '', // Ensure id is always a string for NextAuth
            username: sharedUser.username,
            email: sharedUser.email,
            merchantIds: sharedUser.merchantIds || [],
            role: sharedUser.role,
          };
        } catch (error) {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: any) {      
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.merchantIds = user.merchantIds;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          id: token.id as string,
          username: token.username as string,
          email: token.email as string,
          merchantIds: token.merchantIds as string[],
          role: token.role as string,
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
};

export default NextAuth(authOptions); 