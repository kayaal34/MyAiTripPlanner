import { useState } from "react";
import { X } from "lucide-react";
import { loginUser, getCurrentUser, registerUser } from "../services/api";
import { useAuthStore } from "../store/useAuthStore";

interface AuthModalProps {
    onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const { login } = useAuthStore();

    // Login form
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
    });

    // Register form
    const [registerData, setRegisterData] = useState({
        username: "",
        email: "",
        password: "",
        full_name: "",
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Login API call
            const authResponse = await loginUser(loginData);
            
            // Get user info
            const user = await getCurrentUser(authResponse.access_token);
            
            // Save to store
            login(authResponse.access_token, user);
            
            onClose();
        } catch (err: any) {
            setError(err.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Register API call
            await registerUser(registerData);
            
            // Auto login after register
            const authResponse = await loginUser({
                username: registerData.username,
                password: registerData.password,
            });
            
            const user = await getCurrentUser(authResponse.access_token);
            login(authResponse.access_token, user);
            
            onClose();
        } catch (err: any) {
            setError(err.message || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-slide-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Title */}
                <h2 className="text-3xl font-bold text-[#1e3a8a] mb-2">
                    {isLogin ? "Вход" : "Регистрация"}
                </h2>
                <p className="text-gray-600 mb-6">
                    {isLogin
                        ? "Войдите, чтобы сохранить ваши маршруты"
                        : "Создайте аккаунт для доступа ко всем функциям"}
                </p>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                {isLogin ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                value={loginData.username}
                                onChange={(e) =>
                                    setLoginData({ ...loginData, username: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={loginData.password}
                                onChange={(e) =>
                                    setLoginData({ ...loginData, password: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            {loading ? "Вход..." : "Войти"}
                        </button>
                    </form>
                ) : (
                    /* Register Form */
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Полное имя
                            </label>
                            <input
                                type="text"
                                value={registerData.full_name}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, full_name: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                value={registerData.username}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, username: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={registerData.email}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, email: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Пароль
                            </label>
                            <input
                                type="password"
                                value={registerData.password}
                                onChange={(e) =>
                                    setRegisterData({ ...registerData, password: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            {loading ? "Регистрация..." : "Зарегистрироваться"}
                        </button>
                    </form>
                )}

                {/* Toggle */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {isLogin
                            ? "Нет аккаунта? Зарегистрируйтесь"
                            : "Уже есть аккаунт? Войти"}
                    </button>
                </div>
            </div>
        </div>
    );
}
