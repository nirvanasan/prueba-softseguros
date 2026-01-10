import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute verifica si hay token en localStorage
 * Si no hay token, redirige al login
 * Si hay token, renderiza los componentes hijos
 */
export default function ProtectedRoute() {
    const token = localStorage.getItem("token");

    if (!token) {
        // Redirige al login
        return <Navigate to="/" replace />;
    }

    // Renderiza el contenido protegido
    return <Outlet />;
}
