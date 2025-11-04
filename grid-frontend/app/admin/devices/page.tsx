"use client"
import { Button } from "@/components/ui/button";
import { AddDeviceDrawer } from "@/components/views/devices";
import { useState } from "react";
import { useRequests } from "@/lib/useRequests";
import { motion } from "framer-motion";
import { DeviceTable } from "@/components/views/devices";

export default function AdminPage() {
    const [open, setOpen] = useState(false);
    const datahook = useRequests({
        requests: [
            {
                url: "/admin/devices",
                resType: "json"
            }
        ]
    });
    return <motion.div className="page-layout" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
        <div className="page-header">
            <div>
                <div className="page-header-title">Devices</div>
                <div className="page-header-subtitle">Manage your devices</div>
            </div>
            <AddDeviceDrawer open={open} setOpen={setOpen} datahook={datahook} />
        </div>
        <DeviceTable datahook={datahook} />
    </motion.div>
}