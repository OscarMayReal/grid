"use client"
import { useState } from "react";
import { useRequests } from "@/lib/useRequests";
import { motion } from "framer-motion";
import { DeviceGroupTable } from "@/components/views/devicegroups";
import { AddDeviceGroupDrawer } from "@/components/views/devicegroups";

export default function AdminPage() {
    const [open, setOpen] = useState(false);
    const datahook = useRequests({
        requests: [
            {
                url: "/admin/devicegroups",
                resType: "json"
            }
        ]
    });
    return <motion.div className="page-layout" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
        <div className="page-header">
            <div>
                <div className="page-header-title">Device Groups</div>
                <div className="page-header-subtitle">Manage your device groups</div>
            </div>
            <AddDeviceGroupDrawer open={open} setOpen={setOpen} datahook={datahook} />
        </div>
        <DeviceGroupTable datahook={datahook} />
    </motion.div>
}