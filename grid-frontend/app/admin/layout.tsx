import { Header } from "@/components/header";
import { AccessSidebar, AdminSidebar } from "@/components/sidebar";

export const metadata = {
  title: "Quntem Grid Admin",
  description: "Administer your Quntem Grid Fleet",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Header title="Quntem Grid Admin Center" />
    <div className="page-sidebar-split">
        <AdminSidebar />
        {children}
    </div>
    </>
  );
}