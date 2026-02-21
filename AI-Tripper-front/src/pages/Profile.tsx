import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { 
    updateProfile, 
    deleteAccount, 
    getSavedRoutes, 
    getRouteHistory
} from "../services/api";
import type { 
    UpdateProfileRequest,
    SavedRouteResponse,
    RouteHistoryResponse
} from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user, token, logout, updateUser } = useAuthStore();
    const navigate = useNavigate();
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedRoutes, setSavedRoutes] = useState<SavedRouteResponse[]>([]);
    const [routeHistory, setRouteHistory] = useState<RouteHistoryResponse[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState<UpdateProfileRequest>({
        full_name: user?.full_name || "",
        bio: user?.bio || "",
        hobbies: user?.hobbies || [],
        interests: user?.interests || [],
    });

    const [newHobby, setNewHobby] = useState("");
    const [newInterest, setNewInterest] = useState("");

    // Load user routes
    useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        const loadRoutes = async () => {
            try {
                const [saved, history] = await Promise.all([
                    getSavedRoutes(token),
                    getRouteHistory(token)
                ]);
                setSavedRoutes(saved);
                setRouteHistory(history);
            } catch (err) {
                console.error("Failed to load routes:", err);
            }
        };

        loadRoutes();
    }, [token, navigate]);

    const handleUpdateProfile = async () => {
        if (!token) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const updatedUser = await updateProfile(token, formData);
            updateUser(updatedUser);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!token) return;
        
        setLoading(true);
        try {
            await deleteAccount(token);
            logout();
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete account");
            setLoading(false);
        }
    };

    const addHobby = () => {
        if (newHobby.trim() && !formData.hobbies?.includes(newHobby.trim())) {
            setFormData({
                ...formData,
                hobbies: [...(formData.hobbies || []), newHobby.trim()]
            });
            setNewHobby("");
        }
    };

    const removeHobby = (hobby: string) => {
        setFormData({
            ...formData,
            hobbies: formData.hobbies?.filter(h => h !== hobby)
        });
    };

    const addInterest = () => {
        if (newInterest.trim() && !formData.interests?.includes(newInterest.trim())) {
            setFormData({
                ...formData,
                interests: [...(formData.interests || []), newInterest.trim()]
            });
            setNewInterest("");
        }
    };

    const removeInterest = (interest: string) => {
        setFormData({
            ...formData,
            interests: formData.interests?.filter(i => i !== interest)
        });
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex justify-between items-center"
                >
                    <h1 className="text-4xl font-bold text-gray-800">👤 Мой Профиль</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                    >
                        ← Главная
                    </button>
                </motion.div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Profile Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-lg p-8 mb-8"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                        >
                            {isEditing ? "Отмена" : "Редактировать"}
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Полное Имя
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name || ""}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    О себе
                                </label>
                                <textarea
                                    value={formData.bio || ""}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Расскажите о себе..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Хобби
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newHobby}
                                        onChange={(e) => setNewHobby(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && addHobby()}
                                        placeholder="Добавить хобби..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={addHobby}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.hobbies?.map((hobby, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {hobby}
                                            <button
                                                onClick={() => removeHobby(hobby)}
                                                className="text-purple-900 hover:text-purple-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Интересы
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newInterest}
                                        onChange={(e) => setNewInterest(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && addInterest()}
                                        placeholder="Добавить интерес..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        onClick={addInterest}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.interests?.map((interest, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {interest}
                                            <button
                                                onClick={() => removeInterest(interest)}
                                                className="text-blue-900 hover:text-blue-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleUpdateProfile}
                                disabled={loading}
                                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? "Сохранение..." : "Сохранить Изменения"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {user.full_name && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Полное Имя</h3>
                                    <p className="text-lg text-gray-800">{user.full_name}</p>
                                </div>
                            )}
                            
                            {user.bio && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">О себе</h3>
                                    <p className="text-gray-700">{user.bio}</p>
                                </div>
                            )}

                            {user.hobbies && user.hobbies.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Хобби</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.hobbies.map((hobby, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                            >
                                                {hobby}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {user.interests && user.interests.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Интересы</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.interests.map((interest, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Routes Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-lg p-8 mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Мои Маршруты</h2>

                    {routeHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            У вас пока нет созданных маршрутов
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {routeHistory.map((route) => (
                                <div
                                    key={route.id}
                                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{route.city}</h3>
                                            <p className="text-sm text-gray-500">
                                                {route.stops} точек • {route.mode}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {route.interests.map((interest, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                                                    >
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(route.created_at).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Delete Account Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-lg p-8"
                >
                    <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Опасная Зона</h2>
                    <p className="text-gray-600 mb-4">
                        Удаление аккаунта необратимо. Все ваши данные, маршруты и избранное будут удалены.
                    </p>
                    
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition"
                        >
                            Удалить Аккаунт
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-red-600 font-medium">
                                Вы уверены? Это действие нельзя отменить!
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                                >
                                    {loading ? "Удаление..." : "Да, Удалить"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
