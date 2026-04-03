import WarehouseLayout from "@/components/layout/WarehouseLayout";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <WarehouseLayout>{children}</WarehouseLayout>;
};

export default Layout;
