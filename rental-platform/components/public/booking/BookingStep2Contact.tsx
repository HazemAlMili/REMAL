// ═══════════════════════════════════════════════════════════
// components/public/booking/BookingStep2Contact.tsx
// Step 2: Auth-state branching + inline register/login tabs
// ═══════════════════════════════════════════════════════════

"use client";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import api from "@/lib/api/axios";
import { endpoints } from "@/lib/api/endpoints";
import { InlineRegisterForm } from "./InlineRegisterForm";
import { InlineLoginForm } from "./InlineLoginForm";
import { Button } from "@/components/ui/Button";
import { AlertCircle, LogOut, UserCheck } from "lucide-react";

type ContactTab = "register" | "login";

interface BookingStep2ContactProps {
  onContactSet: (data: {
    clientId: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string | null;
  }) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function BookingStep2Contact({
  onContactSet,
  onContinue,
  onBack,
}: BookingStep2ContactProps) {
  const { subjectType, user, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ContactTab>("register");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ─── Case 1: Already logged in as Client → Auto-skip ───
  if (subjectType === "Client" && user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
          <UserCheck className="h-5 w-5 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Signed in</p>
            <p className="text-sm text-green-700">
              Booking as: {user.identifier} {/* Phone number for clients */}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={onContinue}
          >
            Continue to Review
          </Button>
        </div>
      </div>
    );
  }

  // ─── Case 2: Logged in as Admin or Owner → Error ───
  if (subjectType === "Admin" || subjectType === "Owner") {
    const handleLogout = async () => {
      setIsLoggingOut(true);
      try {
        await api.post(endpoints.auth.logout); // Call API FIRST per FE-1-AUTH-05
      } catch {
        // Even if API logout fails, clear local state
      } finally {
        clearAuth(); // THEN clear store
        setIsLoggingOut(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Wrong account type
            </p>
            <p className="text-sm text-amber-700">
              You&apos;re logged in as an {subjectType?.toLowerCase()} account.
              Please log out to continue as a client.
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          onClick={handleLogout}
          isLoading={isLoggingOut}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>

        <Button variant="ghost" onClick={onBack} className="w-full">
          Back to Booking Details
        </Button>
      </div>
    );
  }

  // ─── Case 3: Anonymous → Show register/login tabs ───
  const handleRegisterSuccess = (data: {
    clientId: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string | null;
  }) => {
    onContactSet(data);
    onContinue(); // Auto-proceed to Step 3
  };

  const handleLoginSuccess = (data: {
    clientId: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string | null;
  }) => {
    onContactSet(data);
    onContinue(); // Auto-proceed to Step 3
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("register")}
          className={`flex-1 border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "register"
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          New to the platform
        </button>
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "login"
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Already have an account
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "register" && (
        <InlineRegisterForm onSuccess={handleRegisterSuccess} />
      )}

      {activeTab === "login" && (
        <InlineLoginForm onSuccess={handleLoginSuccess} />
      )}

      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="w-full">
        Back to Booking Details
      </Button>
    </div>
  );
}
