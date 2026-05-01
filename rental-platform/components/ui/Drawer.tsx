"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  const [mounted, setMounted] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Portal mount handling
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check for reduced motion preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Escape key and scroll lock
  React.useEffect(() => {
    if (!isOpen || !mounted) return;

    // Save previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("overflow-hidden");

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("overflow-hidden");
      // Restore focus when drawer closes
      previousFocusRef.current?.focus();
    };
  }, [isOpen, mounted, onClose]);

  if (!mounted) return null;

  const transitionConfig = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.32, 0.72, 0, 1] };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitionConfig}
            className="bg-neutral-900/60 absolute inset-0 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "drawer-title" : undefined}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitionConfig}
            className={cn(
              "absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl",
              "flex flex-col"
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              {title ? (
                <h2
                  id="drawer-title"
                  className="text-lg font-semibold text-neutral-800"
                >
                  {title}
                </h2>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

Drawer.displayName = "Drawer";
