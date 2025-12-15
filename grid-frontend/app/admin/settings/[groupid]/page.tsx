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
import { ChevronRightIcon, Trash2Icon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { InputField } from "@/components/fields";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthState, useAuth } from "keystone-lib";

export default function SettingsGroupPage({ params }: { params: Usable<{ groupid: string }> }) {
    const auth = useAuth({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL! });
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
                    <Accordion type="multiple" collapsible>
                        <ItemGroup className="border-1 rounded-lg shadow-sm" style={{
                            backgroundColor: "white"
                        }}>
                            {Object.entries(policies.types[key].types).map(([key2, value2]) => {
                                return <AccordionItem value={key2} key={key2}><AccordionTrigger className="p-0 flex-1">
                                    <Item className="flex-1">
                                        <ItemMedia>
                                            <value2.Icon style={{
                                                color: "var(--qu-foreground)"
                                            }} />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle style={{
                                                color: "var(--qu-foreground)"
                                            }}>{value2.name} ({datahook.data["/admin/devicegroup/" + newparams.groupid]?.data?.policies?.filter((policy) => policy.type === value2.policyname && policy.enabled).length || 0} enabled,  {datahook.data["/admin/devicegroup/" + newparams.groupid]?.data?.policies?.filter((policy) => policy.type === value2.policyname).length || 0} total)</ItemTitle>
                                            <ItemDescription style={{
                                                color: "var(--qu-foreground-secondary)"
                                            }}>{value2.description}</ItemDescription>
                                        </ItemContent>
                                        <div className="flex-1" />
                                        <ItemActions>
                                            {/* <ChevronRightIcon size={20} color="var(--qu-foreground)" /> */}
                                        </ItemActions>
                                    </Item></AccordionTrigger>
                                    <AccordionContent className="pb-0">
                                        <Separator />
                                        <ItemGroup>
                                            {datahook.data["/admin/devicegroup/" + newparams.groupid]?.data?.policies?.filter((policy) => policy.type === value2.policyname).map((policy) => {
                                                return <PolicyItem auth={auth} key={policy.id} policy={policy} policyType={value2} datahook={datahook} />
                                            })}
                                            {datahook.data["/admin/devicegroup/" + newparams.groupid]?.data?.policies?.filter((policy) => policy.type === value2.policyname).length === 0 && <Item key="no-policies" className="ml-4 border-l-1 border-l-gray-200 rounded-none">
                                                <ItemContent>
                                                    <ItemTitle style={{
                                                        color: "var(--qu-foreground)"
                                                    }}>No policies</ItemTitle>
                                                    <ItemDescription style={{
                                                        color: "var(--qu-foreground-secondary)"
                                                    }}>No policies found</ItemDescription>
                                                </ItemContent>
                                            </Item>}
                                        </ItemGroup>
                                    </AccordionContent>
                                </AccordionItem>
                            })}
                        </ItemGroup>
                    </Accordion>
                </TabsContent>
            })}
        </Tabs>
    </motion.div>
}

function PolicyItem({ auth, policy, policyType, datahook }: { auth: AuthState, policy: any, policyType: any, datahook: any }) {
    const [list, setList] = useState([]);
    const [policyValue, setPolicyValue] = useState(JSON.parse(policy.value));
    return <Drawer onAnimationEnd={async (open) => {
        if (!open) {
            await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/admin/policy/" + policy.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                    "Authorization": `Bearer ${auth.data?.sessionId}`,
                },
                body: JSON.stringify({
                    ...policy,
                    value: JSON.stringify(policyValue)
                }),
            })
            datahook.reload();
        }
    }} direction="right" handleOnly>
        <DrawerTrigger asChild>
            <Item key={policy.id} className="ml-4 border-l-1 border-l-gray-200 rounded-none">
                <ItemMedia>
                    <policyType.Icon style={{
                        color: "var(--qu-foreground)"
                    }} />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle style={{
                        color: "var(--qu-foreground)"
                    }}>{policy.name}</ItemTitle>
                    <ItemDescription style={{
                        color: "var(--qu-foreground-secondary)"
                    }}>{policy.description}</ItemDescription>
                </ItemContent>
                <div className="flex-1" />
                <ItemActions>
                    {/* <ChevronRightIcon size={20} color="var(--qu-foreground)" /> */}
                </ItemActions>
            </Item>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader style={{
                gap: "0px"
            }}>
                <DrawerTitle style={{ color: "var(--qu-text)", fontWeight: "500" }}>{policy.name}</DrawerTitle>
                <DrawerDescription style={{ color: "var(--qu-text-secondary)" }}>
                    {policy.description}
                </DrawerDescription>
            </DrawerHeader>
            <Separator />
            <div className="drawer-mainarea">
                {Object.entries(policyType.schema.properties).map(([keyItem, valueItem]) => {
                    return <PolicyEditor key={keyItem} policy={policyValue} setValue={setPolicyValue} keyItem={keyItem} valueItem={valueItem} />
                })}
            </div>
        </DrawerContent>
    </Drawer>
}

function PolicyEditor({ policy, setValue, keyItem, valueItem }: { policy: any, setValue: any, keyItem: string, valueItem: string }) {
    console.log(valueItem);
    return <div key={keyItem} className="p-[20px] pb-0">
        <div className="font-semibold">{valueItem.title}</div>
        <div className="text-sm text-gray-500 pb-2">{valueItem.description}</div>
        {valueItem.type === "array" &&
            <ListEditor list={policy[keyItem]} setList={(list) => setValue({ ...policy, [keyItem]: list })} />}
        {valueItem.type === "string" && valueItem.enum !== undefined &&
            <EnumEditor value={policy[keyItem]} setValue={(value) => setValue({ ...policy, [keyItem]: value })} enum={valueItem.enum} />}
        {valueItem.type === "string" && valueItem.enum === undefined &&
            <Input value={policy[keyItem]} className="bg-white" onChange={(e) => setValue({ ...policy, [keyItem]: e.target.value })} />}
    </div>
}

function EnumEditor({ value, setValue, enum: enumValues }: { value: any, setValue: any, enum: any }) {
    return <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="bg-white w-full">
            <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
            {enumValues.map((enumValue: any) => {
                return <SelectItem style={{
                    color: "var(--qu-text)"
                }} key={enumValue} value={enumValue}>{enumValue}</SelectItem>
            })}
        </SelectContent>
    </Select>
}

function ListEditor({ list, setList }: { list: any, setList: any }) {
    const [value, setValue] = useState("");
    return <div>
        <Input placeholder="Add item" className="bg-white" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
                setList([...list, value]);
                setValue("");
            }
        }} />
        {list.length > 0 && <div className="flex flex-col bg-white rounded-md border-1 shadow-sm mt-2">
            {list.map((item: any, index: number) => {
                return <div key={index}><div className="flex items-center gap-2 p-2 px-3">
                    {item}
                    <div className="flex-1" />
                    <Trash2Icon size={16} onClick={() => {
                        setList(list.filter((_, i) => i !== index));
                    }} />
                </div>{index < list.length - 1 && <Separator />}</div>
            })}
        </div>}
    </div>
}