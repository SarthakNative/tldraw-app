import React from "react";
import Header from "./Header"; 
import { usePathname } from "next/navigation";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
  return (
    <>
      {!isLoginPage && <Header />}
      <main>{children}</main>
    </>
  );
};

export default Layout;