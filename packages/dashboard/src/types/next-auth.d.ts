import { UserRole } from '@fugata/shared';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    email: string;
    merchantIds: string[];
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      merchantIds: string[];
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    email: string;
    merchantIds: string[];
    role: UserRole;
  }
} 