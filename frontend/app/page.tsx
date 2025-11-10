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
            Aladia Full-Stack Application
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Modern microservices architecture with NestJS backend and Next.js frontend
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/users">
              <Button variant="outline" size="lg">
                View Users
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">🚀 Fast & Scalable</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built with modern tech stack for optimal performance
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">🔒 Secure</h3>
              <p className="text-gray-600 dark:text-gray-400">
                JWT authentication and encrypted passwords
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">♿ Accessible</h3>
              <p className="text-gray-600 dark:text-gray-400">
                WCAG compliant components and ARIA support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
