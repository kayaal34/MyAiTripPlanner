import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-2 text-sm mb-6">
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
                <Home className="w-4 h-4" />
                <span>Ana Sayfa</span>
            </button>
            
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    {item.path && index < items.length - 1 ? (
                        <button
                            onClick={() => navigate(item.path)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span className="text-blue-600 font-semibold">{item.label}</span>
                    )}
                </div>
            ))}
        </div>
    );
}
