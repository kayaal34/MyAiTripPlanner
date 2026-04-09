import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { AlertTriangle, CreditCard, Lock, Mail, Shield, Trash2, User } from "lucide-react";
import { ApiError, deleteAccount, updateProfile } from "../services/api";

type ProfileTab = "account" | "security" | "subscription";

export default function Profile() {
    const { user, token, updateUser, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState<ProfileTab>("account");
    const [newName, setNewName] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [confirmModalType, setConfirmModalType] = useState<"rename" | "delete" | null>(null);
    const [duplicateNameError, setDuplicateNameError] = useState(false);
    const [shakeNameInput, setShakeNameInput] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [securityError, setSecurityError] = useState("");
    const [securityMessage, setSecurityMessage] = useState("");

    useEffect(() => {
        if (!user) {
            return;
        }
        setNewName(user.username || "");
    }, [user]);

    useEffect(() => {
        const requestedTab = location.state?.activeTab;
        if (!requestedTab) {
            return;
        }

        const tabMap: Record<string, ProfileTab> = {
            "Мой аккаунт": "account",
            "Безопасность": "security",
            "Подписка": "subscription",
        };

        const mapped = tabMap[requestedTab];
        if (mapped) {
            setActiveTab(mapped);
        }
    }, [location.state]);

    if (!user) {
        return null;
    }

    const remainingRoutes = user.remaining_routes ?? 0;
    const planStatus = useMemo(() => {
        return remainingRoutes > 10 ? "Premium" : "Free";
    }, [remainingRoutes]);

    const initials = (user.username || user.email || "U").charAt(0).toUpperCase();

    const openConfirmModal = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedName = newName.trim();

        setGeneralError("");
        setSuccessMessage("");
        setDuplicateNameError(false);

        if (!trimmedName) {
            setGeneralError("Новое имя пользователя обязательно.");
            return;
        }

        if (trimmedName === user.username) {
            setGeneralError("Введите новое имя пользователя.");
            return;
        }

        setConfirmModalType("rename");
    };

    const triggerDuplicateAnimation = () => {
        setDuplicateNameError(true);
        setShakeNameInput(false);
        window.setTimeout(() => setShakeNameInput(true), 0);
        window.setTimeout(() => setShakeNameInput(false), 500);
    };

    const handleConfirmSave = async () => {
        const nextName = newName.trim();

        if (!token) {
            setGeneralError("Сессия истекла. Войдите заново.");
            setConfirmModalType(null);
            return;
        }

        setIsSaving(true);
        setGeneralError("");
        setSuccessMessage("");
        setDuplicateNameError(false);

        try {
            const updatedUser = await updateProfile(token, {
                username: nextName,
            });
            updateUser(updatedUser);
            setSuccessMessage("Имя пользователя успешно обновлено.");
            setConfirmModalType(null);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.statusCode === 409) {
                    triggerDuplicateAnimation();
                    setGeneralError("❌ Это имя уже занято");
                    setConfirmModalType(null);
                } else {
                    setGeneralError(error.message);
                }
            } else {
                setGeneralError("Не удалось обновить имя пользователя.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteConfirmModal = () => {
        setGeneralError("");
        setSuccessMessage("");
        setConfirmModalType("delete");
    };

    const handleConfirmDelete = async () => {
        if (!token) {
            setGeneralError("Сессия истекла. Войдите заново.");
            setConfirmModalType(null);
            return;
        }

        setIsSaving(true);
        try {
            await deleteAccount(token);
            logout();
            navigate("/");
        } catch {
            setGeneralError("Не удалось удалить аккаунт.");
            setConfirmModalType(null);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSecurityError("");
        setSecurityMessage("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setSecurityError("Заполните все поля безопасности.");
            return;
        }

        if (newPassword.length < 6) {
            setSecurityError("Новый пароль должен быть не менее 6 символов.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setSecurityError("Новый пароль и подтверждение не совпадают.");
            return;
        }

        setSecurityMessage("Пароль успешно обновлен.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans py-12 px-4 md:px-6">
            <Navbar />
            <div className="max-w-6xl mx-auto mt-24">
                <Breadcrumb items={[{ label: "Hesabım" }]} />

                <div className="mt-6 flex flex-col lg:flex-row gap-6">
                    <aside className="w-full lg:w-72 shrink-0 rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center gap-3 px-3 py-4 mb-3">
                            <div className="h-12 w-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-orange-500/20">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Личный кабинет</p>
                                <p className="text-base font-bold text-gray-900 truncate">{user.username}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("account")}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                                    activeTab === "account"
                                        ? "bg-orange-50 text-orange-600 font-bold"
                                        : "text-gray-500 hover:bg-gray-50 font-semibold"
                                }`}
                            >
                                <User className="w-5 h-5" />
                                <span>Мой аккаунт</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("security")}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                                    activeTab === "security"
                                        ? "bg-orange-50 text-orange-600 font-bold"
                                        : "text-gray-500 hover:bg-gray-50 font-semibold"
                                }`}
                            >
                                <Shield className="w-5 h-5" />
                                <span>Безопасность</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("subscription")}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                                    activeTab === "subscription"
                                        ? "bg-orange-50 text-orange-600 font-bold"
                                        : "text-gray-500 hover:bg-gray-50 font-semibold"
                                }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>Подписка</span>
                            </button>
                        </nav>
                    </aside>

                    <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                        {activeTab === "account" && (
                            <div className="space-y-8">
                                <header className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-orange-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-orange-500/20">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{user.username}</h2>
                                        <div className="mt-2 text-gray-500 font-medium inline-flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{user.email}</span>
                                        </div>
                                    </div>
                                    </div>
                                </header>

                                <form onSubmit={openConfirmModal} className="space-y-5">
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Настройки</p>
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Изменить имя пользователя</h3>
                                        <label className="block">
                                            <span className="text-sm text-gray-600 font-bold">Новое имя</span>
                                            <div className="mt-2 relative">
                                                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => {
                                                        setNewName(e.target.value);
                                                        setDuplicateNameError(false);
                                                        setGeneralError("");
                                                    }}
                                                    className={`w-full rounded-xl bg-gray-50 px-12 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 transition-all ${
                                                        duplicateNameError
                                                            ? "border-red-500 focus:ring-red-500/20 bg-red-50"
                                                            : "border-transparent focus:ring-orange-500/20 focus:bg-white border focus:border-orange-500"
                                                    } ${shakeNameInput ? "animate-shake" : ""}`}
                                                    placeholder="Введите новое имя пользователя"
                                                />
                                            </div>
                                            {duplicateNameError && (
                                                <div className="mt-3 inline-flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span>❌ Это имя уже занято</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="submit"
                                            className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/10"
                                        >
                                            Сохранить изменения
                                        </button>
                                        {successMessage && <p className="text-sm text-green-600 font-bold px-4 py-2 bg-green-50 rounded-lg">{successMessage}</p>}
                                        {generalError && !duplicateNameError && (
                                            <p className="text-sm text-red-600 font-bold px-4 py-2 bg-red-50 rounded-lg">{generalError}</p>
                                        )}
                                    </div>
                                </form>

                                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                                    <div className="flex items-center gap-2 text-red-700 mb-2">
                                        <Trash2 className="w-5 h-5" />
                                        <h3 className="font-extrabold text-lg">Опасная зона</h3>
                                    </div>
                                    <p className="text-sm text-red-700/80 mb-5 font-medium">
                                        Действие необратимо. Убедитесь, что сохранили все важные данные перед удалением аккаунта.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openDeleteConfirmModal}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-bold shadow-md shadow-red-600/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Удалить аккаунт
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center gap-2 text-gray-900 mb-2">
                                        <Lock className="w-6 h-6 text-orange-500" />
                                        <h3 className="text-xl font-extrabold">Сменить пароль</h3>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 mb-8">
                                        Обновите пароль, чтобы повысить безопасность аккаунта.
                                    </p>

                                    <form onSubmit={handleSavePassword} className="space-y-5">
                                        <label className="block">
                                            <span className="text-sm text-gray-600 font-bold">Текущий пароль</span>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="mt-2 w-full rounded-xl bg-gray-50 px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 border border-transparent transition-all"
                                                placeholder="Введите текущий пароль"
                                            />
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <label className="block">
                                                <span className="text-sm text-gray-600 font-bold">Новый пароль</span>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="mt-2 w-full rounded-xl bg-gray-50 px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 border border-transparent transition-all"
                                                    placeholder="Введите новый пароль"
                                                />
                                            </label>

                                            <label className="block">
                                                <span className="text-sm text-gray-600 font-bold">Подтвердите пароль</span>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="mt-2 w-full rounded-xl bg-gray-50 px-4 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/20 border border-transparent transition-all"
                                                    placeholder="Повторите новый пароль"
                                                />
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 pt-4">
                                            <button
                                                type="submit"
                                                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/10"
                                            >
                                                Сохранить пароль
                                            </button>
                                            {securityMessage && <p className="text-sm text-green-600 font-bold px-4 py-2 bg-green-50 rounded-lg">{securityMessage}</p>}
                                            {securityError && <p className="text-sm text-red-600 font-bold px-4 py-2 bg-red-50 rounded-lg">{securityError}</p>}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "subscription" && (
                            <div className="space-y-6">
                                <div className="rounded-3xl bg-orange-500 text-white p-8 shadow-xl shadow-orange-500/20 overflow-hidden relative">
                                    <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl point-events-none"></div>
                                    
                                    <div className="relative z-10">
                                        <p className="text-sm font-bold text-orange-100 uppercase tracking-wider">Доступные маршруты</p>
                                        <p className="text-6xl font-extrabold mt-2 tracking-tight">{remainingRoutes}</p>
                                        <div className="mt-8 flex flex-wrap items-center gap-4">
                                            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl px-4 py-2.5 font-bold text-sm shadow-sm">
                                                <CreditCard className="w-5 h-5 text-orange-100" />
                                                Текущий план: {planStatus}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => navigate("/pricing")}
                                                className="px-6 py-2.5 rounded-xl bg-white text-orange-600 font-extrabold hover:bg-orange-50 transition-colors shadow-sm"
                                            >
                                                Улучшить тариф
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-6">История покупок</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="text-gray-400 border-b border-gray-100 text-xs uppercase tracking-wider">
                                                    <th className="py-3 font-bold">Дата</th>
                                                    <th className="py-3 font-bold">Пакет</th>
                                                    <th className="py-3 font-bold">Сумма</th>
                                                    <th className="py-3 font-bold">Статус</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4"><span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-md font-bold text-xs">Ожидается</span></td>
                                                </tr>
                                                <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4"><span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-md font-bold text-xs">Ожидается</span></td>
                                                </tr>
                                                <tr className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4 text-gray-700 font-medium">-</td>
                                                    <td className="py-4"><span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-md font-bold text-xs">Ожидается</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {confirmModalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-8">
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                            {confirmModalType === "rename" ? "Изменить имя?" : "Удалить аккаунт?"}
                        </h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            {confirmModalType === "rename" ? (
                                <>
                                    Вы уверены, что хотите изменить свое имя на <span className="font-bold text-gray-800">{newName.trim()}</span>?
                                </>
                            ) : (
                                <>
                                    Это действие нельзя отменить. Все ваши данные будут потеряны навсегда.
                                </>
                            )}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModalType(null)}
                                disabled={isSaving}
                                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold transition-colors disabled:opacity-50"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={confirmModalType === "rename" ? handleConfirmSave : handleConfirmDelete}
                                disabled={isSaving}
                                className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold transition-colors shadow-md disabled:opacity-50 ${
                                    confirmModalType === "rename" 
                                    ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25" 
                                    : "bg-red-600 hover:bg-red-700 shadow-red-600/25"
                                }`}
                            >
                                {isSaving
                                    ? "Подождите..."
                                    : confirmModalType === "rename"
                                      ? "Сохранить"
                                      : "Да, удалить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
