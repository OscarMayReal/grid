"use client"
import { useState } from "react";
import { useRequests } from "@/lib/useRequests";
import { motion } from "framer-motion";
import { DeviceGroupSettingsTable } from "@/components/views/settings";

export default function AdminPage() {
    const datahook = useRequests({
        requests: [
            {
                url: "/admin/policies",
                resType: "json"
            },
            {
                url: "/admin/devicegroups",
                resType: "json"
            }
        ]
    });
    return <motion.div className="page-layout" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
        <div className="page-header">
            <div>
                <div className="page-header-title">Settings</div>
                <div className="page-header-subtitle">Manage your settings</div>
            </div>
        </div>
        <DeviceGroupSettingsTable datahook={datahook} />
    </motion.div>
}