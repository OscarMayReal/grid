"use client"
import { Usable, use, useState } from "react";
import { useRequests } from "@/lib/useRequests";
import { motion } from "framer-motion";
import { DeviceGroupSettingsTable } from "@/components/views/settings";
import { policies } from "@/lib/policiesdefine";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemGroup, Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { ChevronRightIcon } from "lucide-react";

export default function SettingsGroupPage({ params }: { params: Usable<{ groupid: string }> }) {
    const newparams = use(params);
    const datahook = useRequests({
        requests: [
            {
                url: "/admin/devicegroup/" + newparams.groupid,
                resType: "json"
            },
        ]
    });
    return <motion.div className="page-layout" initial={{ x: "50px" }} animate={{ x: "0px" }} transition={{ duration: 0.2, ease: "easeInOut" }}>
        <div className="page-header">
            <div>
                <div className="page-header-title">Settings for "{datahook.data["/admin/devicegroup/" + newparams.groupid]?.data.displayName}"</div>
                <div className="page-header-subtitle">Manage your settings</div>
            </div>
        </div>
        {/* <div className="flex flex-row items-center gap-4">
            {Object.entries(policies.types).map(([key, value]) => {
                return <Card className="flex-1">
                    <CardHeader>
                        <value.Icon style={{
                            color: "var(--qu-foreground)"
                        }} />
                        <CardTitle style={{
                            color: "var(--qu-foreground)"
                        }}>{value.name}</CardTitle>
                    </CardHeader>
                </Card>
            })}
        </div> */}
        <Tabs defaultValue={Object.entries(policies.types)[0][0]}>
            <TabsList>
                {Object.entries(policies.types).map(([key, value]) => {
                    return <TabsTrigger value={key} style={{
                        color: "var(--qu-foreground)"
                    }}><value.Icon />{value.name}</TabsTrigger>
                })}
            </TabsList>
            {Object.entries(policies.types).map(([key, value]) => {
                return <TabsContent value={key}>
                    <ItemGroup className="border-1 rounded-lg shadow-sm" style={{
                        backgroundColor: "white"
                    }}>
                        {Object.entries(policies.types[key].types).map(([key2, value2]) => {
                            return <><Item>
                                <ItemMedia>
                                    <value2.Icon style={{
                                        color: "var(--qu-foreground)"
                                    }} />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle style={{
                                        color: "var(--qu-foreground)"
                                    }}>{value2.name} ({datahook.data["/admin/devicegroup/" + newparams.groupid]?.data?.policies?.filter((policy) => policy.type === value2.policyname).length || 0})</ItemTitle>
                                    <ItemDescription style={{
                                        color: "var(--qu-foreground-secondary)"
                                    }}>{value2.description}</ItemDescription>
                                </ItemContent>
                                <ItemActions>
                                    <ChevronRightIcon size={20} color="var(--qu-foreground)" />
                                </ItemActions>
                            </Item>{Object.entries(policies.types[key].types)[Object.entries(policies.types[key].types).length - 1][0] !== key2 && <Separator />}</>
                        })}
                    </ItemGroup>
                </TabsContent>
            })}
        </Tabs>
    </motion.div>
}