import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    username: string;
    email: string;
    merchantIds: string[];
    role: 'admin' | 'user';
    createdAt?: Date;
    updatedAt?: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    email: string;
    merchantIds: string[];
    role: 'admin' | 'user';
  }
} 