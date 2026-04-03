"use client";

import MasterDataLayout from "@/components/layout/MasterDataLayout";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <MasterDataLayout>{children}</MasterDataLayout>;
};

export default Layout;
