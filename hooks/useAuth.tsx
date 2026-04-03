"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/state/store";

export const useRequireAuth = () => {
  const router = useRouter();
  const { isLoggedIn, userInfo, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, loading, router]);

  return { isLoggedIn, userInfo, loading };
};

export const useGuestOnly = () => {
  const router = useRouter();
  const { isLoggedIn, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!loading && isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, loading, router]);

  return { isLoggedIn, loading };
};
