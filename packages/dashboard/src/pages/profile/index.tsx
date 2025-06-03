import React from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { Button, CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';

interface User {
  username?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Session {
  user?: User;
}

export const dynamic = 'force-dynamic';

export default function Profile() {
  const { data: session } = useSession() as { data: Session | null };
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: session?.user?.username || '',
    email: session?.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Profile Settings
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            View and update your profile information.
            <br />
            <span className="text-red-500">Function to update profile and password is not yet implemented.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Profile Information</h3>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <FormInput
                    label="Username"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                  />

                  <FormInput
                    label="Email"
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />

                  {isEditing && (
                    <>
                      <FormInput
                        label="Current Password"
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      />

                      <FormInput
                        label="New Password"
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      />

                      <FormInput
                        label="Confirm New Password"
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </>
                  )}

                  <div className="flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <CancelButton onClick={() => setIsEditing(false)} />
                        <SubmitButton>
                          Save Changes
                        </SubmitButton>
                      </>
                    ) : (
                      <Button
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Account Information</h3>
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">{session.user?.role || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session.user?.updatedAt ? new Date(session.user.updatedAt).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 