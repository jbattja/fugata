export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    merchantIds: string[];
    role: 'admin' | 'user';
    createdAt: Date;
    updatedAt: Date;
} 
