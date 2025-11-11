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

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              User Management System
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-12">
              Manage your team members with ease
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* New User Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-primary-500">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  New User?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create an account to start managing your team
                </p>
              </div>
              <Link href="/register">
                <Button size="lg" fullWidth>
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Existing User Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Already Have an Account?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Sign in to access your dashboard
                </p>
              </div>
              <Link href="/login">
                <Button variant="secondary" size="lg" fullWidth>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              What You Can Do
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">👥</div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Manage Users</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add, edit, and remove team members
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Secure Access</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  JWT authentication and encryption
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">👁️</div>
                <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">View All Users</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See your users or browse all members
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
