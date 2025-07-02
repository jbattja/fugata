import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { UserRole, UserStatus } from '@fugata/shared';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface MerchantUsersProps {
  merchantId: string;
}

export function MerchantUsers({ merchantId }: MerchantUsersProps) {
  const queryClient = useQueryClient();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: UserRole.USER,
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [error, setError] = useState<JSX.Element | null>(null);
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['merchant-users', merchantId],
    queryFn: async () => {
      const response = await fetch(`/api/merchants/${merchantId}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    enabled: !!merchantId,
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/merchants/${merchantId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(
          <ErrorMessage message={errorData.message} errors={errorData.errors} />
        );
        return;
      }
      
      // Success - reset form and close modal
      setShowAddUser(false);
      setNewUser({ username: '', email: '', password: '', role: UserRole.USER });
      setError(null);
      
      // Refetch users to show the new user
      queryClient.invalidateQueries({ queryKey: ['merchant-users', merchantId] });
    } catch (error) {
      setError(
        <ErrorMessage message="Failed to add user" errors="An unexpected error occurred while adding the user." />
      );
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    const response = await fetch(`/api/merchants/${merchantId}/users`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(
        <ErrorMessage message={errorData.message} errors={errorData.errors} />
      );
    }

    queryClient.invalidateQueries({ queryKey: ['merchant-users', merchantId] });
  };

  const handleSaveChanges = async () => {
    // TODO: Implement save changes functionality
    console.log('Saving user changes');
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  if (error) {
    return (
      <div>
        <ErrorMessage message="Failed to load users" errors="An error occurred while loading users." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="mb-6">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Users</h3>
      </div>

      {showAddUser && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New User</h4>
          <form onSubmit={handleAddUser} className="space-y-4">
            <FormInput
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />
            <FormInput
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <div>
              <FormInput
                label="Initial Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <p className="mt-1 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ This is the initial password. The user should change it after their first login for security.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                isLoading={isAddingUser}
                disabled={isAddingUser}
              >
                {isAddingUser ? 'Adding User...' : 'Add User'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddUser(false)}
                disabled={isAddingUser}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users?.map((user) => (
            <li key={user.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === UserStatus.ACTIVE 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {(!users || users.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No users found for this merchant.
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <Button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add User
        </Button>
      </div>
    </div>
  );
} 