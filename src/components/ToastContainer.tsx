import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#38BDF8] shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#131315] text-[#EDEDED] border border-[#27272A] rounded-xl p-4 shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
          >
            <div className="flex items-start gap-3">
              {iconMap[toast.type]}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed font-sans">
                    {toast.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#71717A] hover:text-[#EDEDED] transition-colors p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
