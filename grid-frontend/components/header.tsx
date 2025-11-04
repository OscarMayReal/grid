"use client"
import "./qui.css"
import { usePathname } from "next/navigation"
import { JSX, useState } from "react"
import { useAuth } from "keystone-lib"
import { useEffect } from "react"
import { InfoIcon, MenuIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWindowSize } from "@/lib/screensize"
import { AvatarFallback } from "@/components/ui/avatar"
import { Avatar } from "@/components/ui/avatar"
import { About } from "./about"

export const Header = ({title}: {title: string}) => {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    const [open, setOpen] = useState(false);
    const path = usePathname();
    const size = useWindowSize();
    useEffect(() => {
        if (auth.data) {
            console.log(auth.data);
        } else if (auth.loaded && auth.error) {
            console.log(auth.error);
            window.location.href = process.env.NEXT_PUBLIC_KEYSTONE_URL! + "/auth/signin?redirectTo=" + window.location.href;
        }
    }, [auth]);
    return (
        <header>
            {(size.width < 1024 && size.width != 0 && !path.startsWith("/apps")) ? <MenuIcon style={{cursor: "pointer", marginLeft: "15px"}} size="20" onClick={() => {setOpen(true)}} /> : auth.data?.user?.tenant?.logo ? <><img src={auth.data?.user?.tenant?.logo} className="header-logo" /><div className="header-logo-divider" /></> : null}
            {/* <img src="/logo.svg" className="header-logo" style={{objectFit: "contain", height: "20px"}} /> */}
            <div style={{width: "15px"}} />
            <div className="header-title">{title}</div>
            <div style={{flex: 1}} />
            <HeaderUser />
        </header>
    );
};

export function UserItem({user, Extra, onClick}: {user: any, Extra?: JSX.Element, onClick?: () => void}) {
    return (
        <div className="flex items-center gap-2" onClick={onClick}>
            <Avatar className="border border-[var(--qu-border-color)]" style={{fontSize: "14px", fontWeight: "400"}}>
                <AvatarFallback style={{color: "var(--qu-text)"}}>{(user.name.charAt(0).toUpperCase() || "?") + (user.name.charAt(1).toUpperCase() || "?")}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold text-sm color-[var(--qu-text)]">{user.name}</span>
                <span className="truncate opacity-70 text-xs color-[var(--qu-text-secondary)]">{user.email}</span>
            </div>
            {Extra}
        </div>
    );
}

function HeaderUser() {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    const size = useWindowSize();
    const [infoOpen, setInfoOpen] = useState(false);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="header-user-container-outer">
                    {(size.width < 550 && size.width != 0) ? null : <div className="header-user-container">
                        <div className="header-user-text">{auth.data?.user?.name} ({auth.data?.user?.tenant?.name + "/" + auth.data?.user?.username})</div>
                        <div className="header-company-text">{auth.data?.user?.email} ({auth.data?.user?.tenant?.name})</div>
                    </div>}
                    <Avatar style={{width: "30px", height: "30px", marginRight: "10px", border: "1px solid var(--qu-border-color)"}}>
                        <AvatarFallback style={{color: "var(--qu-text)"}}>{auth.data?.user?.name?.charAt(0).toUpperCase() + auth.data?.user?.name?.charAt(1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" sideOffset={20} alignOffset={10}>
                <div className="p-2">
                    <UserItem user={auth.data?.user!} />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {setInfoOpen(true)}}><InfoIcon />About Grid</DropdownMenuItem>
            </DropdownMenuContent>
            <About open={infoOpen} setOpen={setInfoOpen} />
        </DropdownMenu>
    );
}