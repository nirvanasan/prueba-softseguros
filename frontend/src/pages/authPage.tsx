import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthPage() {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !password || (!isLogin && !confirmPassword)) {
            setError("Todos los campos son obligatorios");
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            if (isLogin) {
                const res = await axios.post("http://127.0.0.1:8000/auth/login", {
                    email,
                    password
                });

                const token = res.data.access_token;
                localStorage.setItem("token", token);
                navigate("/home");
            } else {
                const res = await axios.post("http://127.0.0.1:8000/auth/register", {
                    email,
                    password
                });

                setSuccess(res.data.message || "Usuario registrado correctamente");
                setTimeout(() => setIsLogin(true), 1500); // luego de registrar, cambia a login
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Ocurrió un error, intenta nuevamente");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
                >
                    {/* ICONO */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="bg-indigo-600 text-white p-3 rounded-full mb-2">
                            <ShoppingCart size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 text-center">
                            Merca YA!
                        </h1>
                    </div>

                    <p className="text-center text-gray-500 mb-6">
                        {isLogin ? "Inicia sesión para comprar" : "Crea tu cuenta para comprar"}
                    </p>

                    {error && (
                        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-600 text-sm mb-4 text-center">{success}</p>
                    )}

                    {/* FORMULARIO */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {!isLogin && (
                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
                        >
                            {isLogin ? "Ingresar" : "Registrarse"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                        <span
                            className="text-indigo-600 cursor-pointer hover:underline"
                            onClick={toggleMode}
                        >
                            {isLogin ? "Regístrate" : "Inicia sesión"}
                        </span>
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
