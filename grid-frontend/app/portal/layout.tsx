"use client"
import { Header } from "@/components/header";
import { PortalSidebar } from "@/components/sidebar";
import { createContext } from "react";
import { useAuth } from "keystone-lib";

// export const metadata = {
//   title: "Quntem Grid Portal",
//   description: "Manage your Grid Experience",
// }

export const AuthContext = createContext({
  auth: undefined,
})

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = useAuth({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL! });
  return (
    <AuthContext.Provider value={{ auth }}>
      <Header title="Quntem Grid Portal" />
      <div className="page-sidebar-split">
        <PortalSidebar />
        {children}
      </div>
    </AuthContext.Provider>
  );
}