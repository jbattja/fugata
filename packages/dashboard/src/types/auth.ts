export interface User {
  id: string;
  username: string;
  email: string;
  merchantIds: string[];
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Merchant {
  id: string;
  name: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermissions {
  canViewPayments: boolean;
  canManageProviders: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
}

export interface Session {
  user: User;
  merchantId: string;
  permissions: UserPermissions;
} 