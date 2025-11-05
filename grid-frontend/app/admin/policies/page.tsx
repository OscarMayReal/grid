"use client"
import { Button } from "@/components/ui/button";
import { AddPolicyDrawer } from "@/components/views/policies";
import { useState } from "react";
import { useRequests } from "@/lib/useRequests";
import { motion } from "framer-motion";
import { PolicyTable } from "@/components/views/policies";

export default function AdminPage() {
    const [open, setOpen] = useState(false);
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
    return <motion.div className="page-layout" initial={{x: "50px"}} animate={{x: "0px"}} transition={{duration: 0.2, ease: "easeInOut"}}>
        <div className="page-header">
            <div>
                <div className="page-header-title">Policies</div>
                <div className="page-header-subtitle">Manage your policies</div>
            </div>
            <AddPolicyDrawer open={open} setOpen={setOpen} datahook={datahook} />
        </div>
        <PolicyTable datahook={datahook} />
    </motion.div>
}