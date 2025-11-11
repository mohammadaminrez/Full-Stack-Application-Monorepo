import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * Home Page
 * Landing page with navigation to registration and user list
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            User Management System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Create and manage user accounts with secure authentication
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Create Account</Button>
            </Link>
            <Link href="/users">
              <Button variant="outline" size="lg">
                Browse Users
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">👥 User Directory</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all registered users in one place
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">🔒 Secure Access</h3>
              <p className="text-gray-600 dark:text-gray-400">
                JWT authentication with encrypted password storage
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">⚡ Quick Registration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Simple sign-up process with instant account creation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
