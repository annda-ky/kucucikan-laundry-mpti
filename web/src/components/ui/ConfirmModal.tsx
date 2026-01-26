import { Loader2, X, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "info",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertCircle className="w-12 h-12 text-red-500 mb-4" />;
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />;
      default:
        return <Info className="w-12 h-12 text-[#C5A059] mb-4" />;
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case "danger":
        return "bg-red-500 hover:bg-red-600";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-[#C5A059] hover:bg-[#b08d4b]";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header with Close Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {getIcon()}

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          <p className="text-sm text-gray-500 dark:text-[#A19E95] mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${getButtonColor()}`}
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
