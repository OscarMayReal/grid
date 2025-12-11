"use client"
import { motion } from "framer-motion";
import { AuthContext } from "@/app/portal/layout";
import { useContext } from "react";

export default function PortalPage() {
    const { auth } = useContext(AuthContext);
    return <motion.div className="page-layout" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
        <div className="page-header">
            <div>
                <div className="page-header-title">Home</div>
                <div className="page-header-subtitle">Manage your IT at {auth?.data?.user?.tenant?.displayName ? auth?.data?.user?.tenant?.displayName : auth?.data?.user?.tenant?.name}</div>
            </div>

        </div>
    </motion.div>
}