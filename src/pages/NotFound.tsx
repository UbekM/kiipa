import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-extrabold text-blue-700 mb-4">404</h1>
        <p className="text-2xl text-gray-700 mb-4">Oops! Page not found</p>
        <p className="mb-6 text-gray-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition mb-2"
        >
          Return to Home
        </a>
        <div className="mt-4">
          <a
            href="/documentation"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
