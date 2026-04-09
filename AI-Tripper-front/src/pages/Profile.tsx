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
            setGeneralError("Имя пользователя обязательно.");
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 md:px-6">
            <Navbar />
            <div className="max-w-6xl mx-auto mt-24">
                <Breadcrumb items={[{ label: "Hesabım" }]} />

                <div className="mt-6 flex flex-col lg:flex-row gap-6">
                    <aside className="w-full lg:w-72 shrink-0 rounded-3xl bg-white/70 backdrop-blur border border-white/70 shadow-lg p-4">
                        <div className="flex items-center gap-3 px-3 py-4 mb-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-slate-500">Личный кабинет</p>
                                <p className="text-base font-semibold text-slate-800 truncate">{user.username}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("account")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition ${
                                    activeTab === "account"
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <User className="w-5 h-5" />
                                <span>Мой аккаунт</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("security")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition ${
                                    activeTab === "security"
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <Shield className="w-5 h-5" />
                                <span>Безопасность</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("subscription")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition ${
                                    activeTab === "subscription"
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-500 hover:bg-gray-50"
                                }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>Подписка</span>
                            </button>
                        </nav>
                    </aside>

                    <section className="flex-1 bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-white/70 p-6 md:p-8">
                        {activeTab === "account" && (
                            <div className="space-y-8">
                                <header className="rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm p-5 md:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="h-20 w-20 rounded-3xl overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{user.username}</h2>
                                        <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            <p className="text-sm font-medium text-slate-700">{user.email}</p>
                                        </div>
                                    </div>
                                    </div>
                                </header>

                                <form onSubmit={openConfirmModal} className="space-y-5">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <p className="text-sm text-slate-500 mb-1">Настройки имени</p>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Изменить имя пользователя</h3>
                                        <label className="block">
                                            <span className="text-sm text-slate-600 font-medium">Новое имя</span>
                                            <div className="mt-2 relative">
                                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => {
                                                        setNewName(e.target.value);
                                                        setDuplicateNameError(false);
                                                        setGeneralError("");
                                                    }}
                                                    className={`w-full rounded-2xl bg-white px-10 py-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 transition ${
                                                        duplicateNameError
                                                            ? "border border-red-500 focus:ring-red-200"
                                                            : "border border-slate-200 focus:ring-blue-300"
                                                    } ${shakeNameInput ? "animate-shake" : ""}`}
                                                    placeholder="Введите новое имя пользователя"
                                                />
                                            </div>
                                            {duplicateNameError && (
                                                <div className="mt-2 inline-flex items-center gap-2 text-red-600 text-sm font-medium">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span>❌ Это имя уже занято</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
                                        >
                                            Сохранить изменения
                                        </button>
                                        {successMessage && <p className="text-sm text-emerald-600 font-medium">{successMessage}</p>}
                                        {generalError && !duplicateNameError && (
                                            <p className="text-sm text-red-600 font-medium">{generalError}</p>
                                        )}
                                    </div>
                                </form>

                                <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
                                    <div className="flex items-center gap-2 text-red-700 mb-3">
                                        <Trash2 className="w-5 h-5" />
                                        <h3 className="font-semibold">Опасная зона</h3>
                                    </div>
                                    <p className="text-sm text-red-700/80 mb-4">
                                        Действие необратимо. Убедитесь, что сохранили все важные данные перед удалением аккаунта.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openDeleteConfirmModal}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Удалить аккаунт
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 text-slate-800">
                                        <Lock className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-xl font-semibold">Сменить пароль</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-5">
                                        Обновите пароль, чтобы повысить безопасность аккаунта.
                                    </p>

                                    <form onSubmit={handleSavePassword} className="space-y-4">
                                        <label className="block">
                                            <span className="text-sm text-slate-600 font-medium">Текущий пароль</span>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                placeholder="Введите текущий пароль"
                                            />
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="block">
                                                <span className="text-sm text-slate-600 font-medium">Новый пароль</span>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    placeholder="Введите новый пароль"
                                                />
                                            </label>

                                            <label className="block">
                                                <span className="text-sm text-slate-600 font-medium">Подтвердите пароль</span>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    placeholder="Повторите новый пароль"
                                                />
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 pt-2">
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
                                            >
                                                Сохранить пароль
                                            </button>
                                            {securityMessage && <p className="text-sm text-emerald-600 font-medium">{securityMessage}</p>}
                                            {securityError && <p className="text-sm text-red-600 font-medium">{securityError}</p>}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === "subscription" && (
                            <div className="space-y-6">
                                <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 shadow-xl">
                                    <p className="text-sm text-indigo-100">Доступные маршруты</p>
                                    <p className="text-4xl font-bold mt-1">{remainingRoutes}</p>
                                    <div className="mt-5 flex flex-wrap items-center gap-3">
                                        <span className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm">
                                            <CreditCard className="w-4 h-4" />
                                            Текущий план: {planStatus}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => navigate("/pricing")}
                                            className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition"
                                        >
                                            Улучшить тариф
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">История покупок</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-200">
                                                    <th className="py-2 font-medium">Дата</th>
                                                    <th className="py-2 font-medium">Пакет</th>
                                                    <th className="py-2 font-medium">Сумма</th>
                                                    <th className="py-2 font-medium">Статус</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">Ожидается</td>
                                                </tr>
                                                <tr className="border-b border-slate-100">
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">Ожидается</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">-</td>
                                                    <td className="py-3 text-slate-700">Ожидается</td>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6">
                        <h3 className="text-xl font-semibold text-slate-900">
                            {confirmModalType === "rename" ? "Подтвердить изменение имени" : "Подтвердить удаление аккаунта"}
                        </h3>
                        <p className="mt-2 text-slate-600">
                            {confirmModalType === "rename" ? (
                                <>
                                    Вы уверены, что хотите изменить свое имя на <span className="font-semibold text-slate-900">{newName.trim()}</span>?
                                </>
                            ) : (
                                <>
                                    Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.
                                </>
                            )}
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModalType(null)}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                onClick={confirmModalType === "rename" ? handleConfirmSave : handleConfirmDelete}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition disabled:opacity-60"
                            >
                                {isSaving
                                    ? "Сохранение..."
                                    : confirmModalType === "rename"
                                      ? "Подтвердить и сохранить"
                                      : "Подтвердить удаление"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
