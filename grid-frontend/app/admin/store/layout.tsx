"use client"
import { Button } from "@/components/ui/button";
import { AddDeviceDrawer } from "@/components/views/devices";
import { useState, useEffect } from "react";
import { useRequests } from "@/lib/useRequests";
import { motion } from "framer-motion";
import { DeviceTable } from "@/components/views/devices";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function AdminPage({children}: {children: React.ReactNode}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [items, setItems] = useState<any>([]);
    const datahook = useRequests({
        requests: [
            {
                url: "/collection/category",
                resType: "json"
            },
            {
                url: "/collection/recently-updated",
                resType: "json"
            }
        ],
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL! + "/flathubproxy",
        noAuth: true
    });
    useEffect(() => {
        if (datahook.loaded && search === "") {
            setItems(datahook.data?.["/collection/recently-updated"]?.data?.hits);
        } else if (search !== "") {
            fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/flathubproxy/search?locale=en", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                },
                body: JSON.stringify({
                    query: search,
                    filters: [],
                    hits_per_page: 100,
                    page: 1
                }),
            }).then((res) => res.json()).then((data) => {
                setItems(data.hits);
            });
        }
    }, [datahook, search]);
    return <motion.div  className="page-layout flex flex-row gap-[20px]" initial={{x: "50px"}} style={{paddingLeft: "0px", overflow: "visible", maxWidth: "calc(100vw - 250px)"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
        <div className="w-[300px] min-w-[300px] h-full bg-white rounded-md shadow-md border-[#e4e4e7] flex flex-col">
            <div className="p-[15px] border-b border-[#e4e4e7]">
                <div className="page-header-title mb-[10px]">Flathub</div>
                <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex-1 overflow-y-auto">
                {items.map((app: any) => <AppItem app={app} />)}
            </div>
        </div>
        <div className="flex-1 bg-white rounded-md shadow-md border-[#e4e4e7]" style={{maxWidth: "calc(100vw - 250px - 300px - 20px - 20px)", overflow: "visible"}}>
            {children}
        </div>
    </motion.div>
}

function AppItem({app}: {app: any}) {
    const router = useRouter();
    return <div className="flex flex-row gap-[15px] items-center border-b border-[#e4e4e7] min-w-[0] py-[5px] px-[15px] hover:bg-[#0000000a]" onClick={() => {router.push("/admin/store/" + app.app_id)}}>
        <img src={app.icon} style={{
            width: 30,
            height: 30
        }} alt={app.name} />
        <div className="min-w-[0]">
            <div className="truncate" style={{
                color: "var(--qu-text)",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "5px"
            }}>
                <div className="display-inline">{app.name}</div>
                {app.verification_verified && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="size-4 text-flathub-celestial-blue display-inline" aria-label="This app is verified"><path fill-rule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"></path></svg>}
            </div>
            <div className="truncate" style={{
                color: "var(--qu-text-secondary)"
            }}>{app.developer_name}</div>
        </div>
    </div>
}