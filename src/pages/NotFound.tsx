import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Shield } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center page-shell px-4">
      <div className="text-center max-w-sm w-full animate-fade-up">
        <div className="brand-mark w-14 h-14 mx-auto mb-6">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <p className="font-display text-5xl text-forest-deep mb-2">404</p>
        <h1 className="font-display text-xl text-forest-deep mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          This path doesn&apos;t exist in Keepr. Head home or check the docs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-keepr">
            Return home
          </Link>
          <Link
            to="/documentation"
            className="btn-native-outline px-6 py-3.5 text-sm"
          >
            Documentation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
