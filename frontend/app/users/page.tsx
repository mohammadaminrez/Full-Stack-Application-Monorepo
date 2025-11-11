'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { InputField } from '@/components/ui/InputField';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { usersApi, authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/**
 * Users Management Page
 * Displays users created by the logged-in user
 * Allows adding, editing, and deleting users
 */
export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my'); // Toggle between my users and all users
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Add user form
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  // Edit user form
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [viewMode]); // Re-fetch when view mode changes

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);

    try {
      // Fetch based on view mode
      const response = viewMode === 'my'
        ? await usersApi.getMyUsers()
        : await authApi.getAllUsers();

      console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(true);
      const message =
        err.response?.status === 401
          ? 'Please log in to view users'
          : 'Failed to load users';
      toast.error(message);

      // Redirect to login on 401
      if (err.response?.status === 401) {
        setTimeout(() => router.push('/login'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateAddForm = () => {
    const newErrors: Record<string, string> = {};

    if (!addFormData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (addFormData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!addFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!addFormData.password) {
      newErrors.password = 'Password is required';
    } else if (addFormData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(addFormData.password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, and number';
    }

    setAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddForm()) {
      return;
    }

    setIsAdding(true);

    try {
      const result = await usersApi.createUser(addFormData);
      console.log('User created:', result.data);
      toast.success('User added successfully!');
      setAddFormData({ name: '', email: '', password: '' });
      setAddErrors({});
      setIsAddModalOpen(false);

      // Fetch updated users list
      console.log('Fetching updated users list...');
      await fetchUsers();
      console.log('Users list refreshed');
    } catch (error: any) {
      console.error('Error adding user:', error);
      const message =
        error.response?.data?.message || 'Failed to add user. Please try again.';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    setIsEditing(true);

    try {
      // Only send fields that were changed
      const updates: any = {};
      if (editFormData.name && editFormData.name !== selectedUser.name) {
        updates.name = editFormData.name;
      }
      if (editFormData.email && editFormData.email !== selectedUser.email) {
        updates.email = editFormData.email;
      }
      if (editFormData.password) {
        updates.password = editFormData.password;
      }

      if (Object.keys(updates).length === 0) {
        toast.error('No changes to save');
        return;
      }

      await usersApi.updateUser(selectedUser.id, updates);
      toast.success('User updated successfully!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setEditFormData({ name: '', email: '', password: '' });
      setEditErrors({});
      fetchUsers();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to update user. Please try again.';
      toast.error(message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    setIsDeleting(userId);

    try {
      await usersApi.deleteUser(userId);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to delete user. Please try again.';
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ name: user.name, email: user.email, password: '' });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {viewMode === 'my' ? 'My Users' : 'All Users'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {viewMode === 'my'
                ? "Manage users you've added to the system"
                : 'View all registered users in the system'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={viewMode === 'my' ? 'primary' : 'outline'}
            onClick={() => setViewMode('my')}
          >
            My Users
          </Button>
          <Button
            variant={viewMode === 'all' ? 'primary' : 'outline'}
            onClick={() => setViewMode('all')}
          >
            All Users
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card variant="elevated" className="max-w-md mx-auto">
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Unable to load users
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please make sure you&apos;re logged in
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
                <Button variant="outline" onClick={fetchUsers}>
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <Card variant="elevated" className="max-w-md mx-auto">
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No users yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by adding your first user
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>Add User</Button>
            </div>
          </Card>
        )}

        {/* Users Grid */}
        {!loading && !error && users.length > 0 && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400">
                Total Users: {users.length}
              </p>
              {viewMode === 'my' && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  + Add User
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card
                  key={user.id}
                  variant="elevated"
                  title={user.name}
                  subtitle={user.email}
                  footer={
                    viewMode === 'my' ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          loading={isDeleting === user.id}
                          fullWidth
                        >
                          Delete
                        </Button>
                      </div>
                    ) : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Added on
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddFormData({ name: '', email: '', password: '' });
          setAddErrors({});
        }}
        title="Add New User"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <InputField
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={addFormData.name}
            onChange={(e) =>
              setAddFormData({ ...addFormData, name: e.target.value })
            }
            error={addErrors.name}
            required
            fullWidth
          />

          <InputField
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={addFormData.email}
            onChange={(e) =>
              setAddFormData({ ...addFormData, email: e.target.value })
            }
            error={addErrors.email}
            required
            fullWidth
          />

          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={addFormData.password}
            onChange={(e) =>
              setAddFormData({ ...addFormData, password: e.target.value })
            }
            error={addErrors.password}
            helperText="Min 8 characters with uppercase, lowercase, and number"
            required
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setAddFormData({ name: '', email: '', password: '' });
                setAddErrors({});
              }}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" loading={isAdding} fullWidth>
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
          setEditFormData({ name: '', email: '', password: '' });
          setEditErrors({});
        }}
        title="Edit User"
        size="md"
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          <InputField
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={editFormData.name}
            onChange={(e) =>
              setEditFormData({ ...editFormData, name: e.target.value })
            }
            error={editErrors.name}
            fullWidth
          />

          <InputField
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={editFormData.email}
            onChange={(e) =>
              setEditFormData({ ...editFormData, email: e.target.value })
            }
            error={editErrors.email}
            fullWidth
          />

          <InputField
            label="New Password (leave blank to keep current)"
            type="password"
            placeholder="••••••••"
            value={editFormData.password}
            onChange={(e) =>
              setEditFormData({ ...editFormData, password: e.target.value })
            }
            error={editErrors.password}
            helperText="Leave blank if you don't want to change the password"
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
                setEditFormData({ name: '', email: '', password: '' });
                setEditErrors({});
              }}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" loading={isEditing} fullWidth>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
