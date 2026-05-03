"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth.store";
import { ROUTES } from "@/lib/constants/routes";
import { OwnerSidebar } from "@/components/owner/layout/OwnerSidebar";
import { OwnerHeader } from "@/components/owner/layout/OwnerHeader";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { subjectType } = useAuthStore();

  useEffect(() => {
    if (subjectType !== "Owner") {
      router.replace(ROUTES.auth.ownerLogin);
    }
  }, [subjectType, router]);

  if (subjectType !== "Owner") {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <OwnerSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
