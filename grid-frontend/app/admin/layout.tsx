import { Header } from "@/components/header";
import { AccessSidebar, AdminSidebar } from "@/components/sidebar";

export const metadata = {
  title: "DeskServer Admin",
  description: "Administer your virtual desktops",
}

export default function AccessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Header title="Grid Admin Center" />
    <div className="page-sidebar-split">
        <AdminSidebar />
        {children}
    </div>
    </>
  );
}