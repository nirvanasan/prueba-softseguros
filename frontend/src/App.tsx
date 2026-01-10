import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import ProtectedRoute from "./components/protectedRoute";
import AuthPage from "./pages/authPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<AuthPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    </BrowserRouter>
  );
}
