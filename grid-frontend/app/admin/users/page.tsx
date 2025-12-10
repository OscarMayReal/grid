"use client"
import { useState } from "react";
import { useRequests } from "@/lib/useRequests";
import { motion } from "framer-motion";
import { DeviceGroupTable } from "@/components/views/devicegroups";
import { AddDeviceGroupDrawer } from "@/components/views/devicegroups";
import { UsersTable } from "@/components/views/users";

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
    return <motion.div className="page-layout" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
        <div className="page-header">
            <div>
                <div className="page-header-title">Users</div>
                <div className="page-header-subtitle">Manage your users</div>
            </div>

        </div>
        <UsersTable />
    </motion.div>
}