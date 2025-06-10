export default function Custom404() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-center text-2xl font-semibold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
    </div>
  );
} 