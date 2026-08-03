import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({
  open,
  onClose,
}: SettingsDrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed right-0 top-0 z-50 h-screen w-[420px] border-l border-slate-800 bg-slate-900 shadow-2xl"
            initial={{ x: 450 }}
            animate={{ x: 0 }}
            exit={{ x: 450 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Settings
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Customize your Resolve experience.
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-8 p-6">
              <div>
                <h3 className="mb-2 font-medium text-white">
                  General
                </h3>

                <p className="text-sm text-slate-400">
                  Application settings will appear here.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-white">
                  Recovery
                </h3>

                <p className="text-sm text-slate-400">
                  Blocking, focus mode and recovery preferences.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-white">
                  Account
                </h3>

                <p className="text-sm text-slate-400">
                  Profile, subscriptions and security.
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}