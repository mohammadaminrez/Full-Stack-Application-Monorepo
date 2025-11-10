'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

/**
 * Users List Page
 * Displays all registered users
 * Integrates with GET /auth/users endpoint
 */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await authApi.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError(true);
      const message =
        err.response?.status === 401
          ? 'Please register to view users'
          : 'Failed to load users';
      toast.error(message);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Registered Users
          </h1>
          <ThemeToggle />
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
                Please make sure you&apos;re registered
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/register">
                  <Button>Register</Button>
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
                Be the first to register!
              </p>
              <Link href="/register">
                <Button>Create Account</Button>
              </Link>
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
              <Link href="/register">
                <Button variant="outline">Add New User</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card
                  key={user.id}
                  variant="elevated"
                  title={user.name}
                  subtitle={user.email}
                  footer={
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {formatDate(user.createdAt)}
                    </div>
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
                        User ID
                      </p>
                      <p className="text-xs font-mono text-gray-600 dark:text-gray-300">
                        {user.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
