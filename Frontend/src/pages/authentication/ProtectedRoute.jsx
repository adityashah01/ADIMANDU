import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    const normalizedRoles = roles.map((role) => role.toLowerCase());
    const userRole = String(user.role || "").toLowerCase();

    if (
        normalizedRoles.length > 0 &&
        !normalizedRoles.includes(userRole)
    ) {
        // Redirect to the user's own dashboard instead of home
        if (userRole === "provider") return <Navigate to="/provider" replace />;
        if (userRole === "admin") return <Navigate to="/admin" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
}
