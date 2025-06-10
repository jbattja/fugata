export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Page</h1>
        <p className="text-gray-600">The page you're trying to access is not available.</p>
        <p className="text-gray-600 mt-2">Please use a valid checkout session URL.</p>
      </div>
    </div>
  );
} 