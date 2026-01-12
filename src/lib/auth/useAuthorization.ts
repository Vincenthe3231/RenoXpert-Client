"use client";

import { useAuth } from "@/lib/api/auth/auth.hooks";
import { isSuperAdmin, isAdmin, canAccessUserModule, hasActiveAccount } from "./authorization";
import { useMemo } from "react";

export function useAuthorization() {
  const { data: user, isLoading } = useAuth();

  return useMemo(
    () => ({
      user,
      isLoading,
      isSuperAdmin: isSuperAdmin(user),
      isAdmin: isAdmin(user),
      canAccessUserModule: canAccessUserModule(user),
      hasActiveAccount: hasActiveAccount(user),
    }),
    [user, isLoading]
  );
}

