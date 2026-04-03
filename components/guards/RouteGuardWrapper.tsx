"use client";

import React from "react";
import { RouteGuard } from "@/components/guards/RouteGuard";

const RouteGuardWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <RouteGuard>{children}</RouteGuard>;
};

export default RouteGuardWrapper;
