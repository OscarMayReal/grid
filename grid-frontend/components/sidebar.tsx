"use client"
import { useRouter } from "next/navigation";
import { useAuth } from "keystone-lib";
import { usePathname } from "next/navigation";
import { useWindowSize } from "@/lib/screensize";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ActivityIcon, ArchiveIcon, ArrowUpCircleIcon, GlobeIcon, GroupIcon, LaptopMinimalIcon, LayoutDashboardIcon, PackageIcon, PlusIcon, ShieldIcon, ShoppingBagIcon, ShoppingCartIcon, UsersIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { HomeIcon } from "lucide-react";
import { SettingsIcon } from "lucide-react";
import { LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

export const AccessSidebar = ({ignoreSize}: {ignoreSize?: boolean}) => {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    const router = useRouter();
    const path = usePathname();
    const size = useWindowSize();
    if (!ignoreSize && (size.width < 1024 && size.width != 0)) {
        return null
    }
    return (
        <div className="sidebar">
            <SidebarUserItem />
            <SidebarItem title="Account" onClick={() => {router.push("/portal")}} Icon={HomeIcon} active={path === "/portal"} index={0} />
            <SidebarItem title="Devices" onClick={() => {router.push("/portal/devices")}} Icon={LaptopMinimalIcon} active={path === "/portal/devices"} index={1} />
            <SidebarItem title="Store" onClick={() => {router.push("/portal/store")}} Icon={LayoutGrid} active={path === "/portal/store"} index={2} />
            <SidebarItem title="Settings" onClick={() => {router.push("/portal/settings")}} Icon={SettingsIcon} active={path === "/portal/settings"} index={3} />
            {auth.data?.user?.role === "ADMIN" && <Separator style={{margin: "10px 0px"}} />}
            {auth.data?.user?.role === "ADMIN" && <SidebarItem title="Admin" onClick={() => {router.push("/admin")}} Icon={SettingsIcon} active={false} index={5} />}
        </div>
    );
};

export const AdminSidebar = ({ignoreSize}: {ignoreSize?: boolean}) => {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    const router = useRouter();
    const path = usePathname();
    const size = useWindowSize();
    if (!ignoreSize && (size.width < 1024 && size.width != 0)) {
        return null
    }
    return (
        <div className="sidebar">
            {/* <SidebarUserItem /> */}
            <div className="sidebar-tenant-name">{auth.data?.user?.tenant?.displayName ? auth.data?.user?.tenant?.displayName : auth.data?.user?.tenant?.name}</div>
            {/* <SidebarItem title="Home" onClick={() => {router.push("/admin")}} Icon={HomeIcon} active={path === "/admin"} index={0} /> */}
            <SidebarItem title="All Devices" onClick={() => {router.push("/admin/devices")}} Icon={LaptopMinimalIcon} active={path === "/admin/devices"} index={1} />
            <SidebarItem title="Groups" onClick={() => {router.push("/admin/devicegroups")}} Icon={GroupIcon} active={path === "/admin/devicegroups"} index={2} />
            <SidebarItem title="Policies" onClick={() => {router.push("/admin/policies")}} Icon={ShieldIcon} active={path === "/admin/policies"} index={3} />
            <SidebarItem title="Store" onClick={() => {router.push("/admin/store")}} Icon={ShoppingCartIcon} active={path.startsWith("/admin/store")} index={4} />
            {/* <SidebarItem title="Solutions" onClick={() => {router.push("/admin/solutions")}} Icon={PackageIcon} active={path === "/admin/solutions"} index={4} /> */}
            {/* <SidebarItem title="Settings" onClick={() => {router.push("/admin/settings")}} Icon={SettingsIcon} active={path === "/admin/settings"} index={5} />
            <SidebarItem title="Updates" onClick={() => {router.push("/admin/updates")}} Icon={ArrowUpCircleIcon} active={path === "/admin/updates"} index={6} /> 
            <SidebarItem title="Monitoring" onClick={() => {router.push("/admin/monitoring")}} Icon={ActivityIcon} active={path === "/admin/monitoring"} index={7} />
            <SidebarItem title="Users" onClick={() => {router.push("/admin/users")}} Icon={UsersIcon} active={path === "/admin/users"} index={8} />
            <Separator style={{margin: "10px 0px"}} />
            <SidebarItem title="Portal" onClick={() => {router.push("/portal")}} Icon={LayoutDashboardIcon} active={false} index={8} /> */}
        </div>
    );
};

function SidebarUserItem() {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    return (
        <div className="sidebar-user-item">
            <Avatar style={{width: "40px", height: "40px", marginRight: "7px", border: "1px solid #e4e4e7"}}>
                <AvatarFallback>{auth.data?.user?.name?.charAt(0).toUpperCase()}{auth.data?.user?.name?.charAt(1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
                <div className="sidebar-user-item-name">{auth.data?.user?.name}</div>
                <div className="sidebar-user-item-tenant">{auth.data?.user?.tenant?.name + "/" + auth.data?.user?.username}</div>
            </div>
        </div>
    );
}

function SidebarItem({title, onClick, Icon, active, index}: {title: string, onClick: () => void, Icon: React.JSX.ElementType, active: boolean, index: number}) {
    return (
        <motion.div className={"sidebar-item" + (active ? " sidebar-item-active" : "")} onClick={onClick} initial={{x: "-100%" }} animate={{x: "0%"}}  transition={{duration: 0.5, delay: index * 0.1}}>
            {active && <motion.div
                key={`tabbar-animated-` + index}
                layoutId="tabbar-animated"
                className="sidebar-item-animated"
                transition={{
                    ease: "easeInOut",

                }}
            />}
            <Icon size="20" />
            <div>{title}</div>
        </motion.div>
    );
}