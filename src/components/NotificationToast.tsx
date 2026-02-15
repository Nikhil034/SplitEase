"use client";

import { motion, AnimatePresence } from "motion/react";

interface NotificationToastProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}

export function NotificationToast({
  message,
  isVisible,
  onDismiss,
}: NotificationToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw]"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg cursor-pointer"
            style={{
              background: "var(--accent-success)",
              border: "1px solid var(--accent-success-solid)",
              color: "var(--text-primary)",
            }}
            onClick={onDismiss}
          >
            <span className="text-sm font-medium">{message}</span>
            <span className="text-xs opacity-80">×</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
