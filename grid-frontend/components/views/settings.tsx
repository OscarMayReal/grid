"use client"
import { useReactTable, getCoreRowModel, ColumnDef, flexRender, Row } from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckIcon, ClipboardCopyIcon, PlusIcon, SaveIcon, SearchIcon, XIcon } from "lucide-react";
import { InputField, MonacoInput, PrefixedInput, SelectField, SwitchInput } from "@/components/fields";
import { useAuth } from "keystone-lib";
import { UserItem } from "@/components/header";
import { ConfirmDialog } from "@/components/confirmDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import Link from "next/link";
import { useRouter } from "next/navigation";


export function DeviceGroupSettingsTable({ datahook }: { datahook: any }) {
    const auth = useAuth({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL! });
    const [deviceGroups, setDeviceGroups] = useState<any>([]);
    useEffect(() => {
        if (datahook.loaded) {
            setDeviceGroups(datahook.data?.["/admin/devicegroups"].data)
        }
    }, [datahook]);
    const table = useReactTable({
        data: deviceGroups,
        columns: [
            {
                header: "Name",
                accessorKey: "displayName",
            },
            {
                header: "Groupname",
                accessorKey: "name",
                cell: ({ row }) => {
                    return (
                        <div>{auth.data?.tenant?.name}/{row.original.name}</div>
                    );
                },
            },
            {
                header: "Settings",
                accessorKey: "_count.policies",
            },
        ],
        getCoreRowModel: getCoreRowModel(),
    });
    if (!datahook.loaded) {
        return <div>Loading...</div>;
    }
    return (
        <div className="overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm w-full">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRowLink key={row.id} row={row} datahook={datahook} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

const TableRowLink = ({ row, datahook }: { row: Row<any>, datahook: any }) => {
    const router = useRouter();
    return (
        // <Link href={`/admin/settings/${row.original.id}`}>
        <TableRow key={row.id} onClick={() => router.push(`/admin/settings/${row.original.id}`)}>
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
        // </Link>
    );
}

function PolicyInfoDrawer({ open, setOpen, policy, datahook }: { open: boolean, setOpen: (open: boolean) => void, policy: any, datahook: any }) {
    const [value, setValue] = useState(policy.value)
    const [type, setType] = useState(policy.type)
    const [name, setName] = useState(policy.name)
    const [description, setDescription] = useState(policy.description)
    const [policyEnabled, setPolicyEnabled] = useState(policy.enabled)
    const auth = useAuth({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL! });
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader style={{ gap: "0px" }}>
                    <DrawerTitle style={{ color: "var(--qu-text)", fontWeight: "500" }}>{policy.name}</DrawerTitle>
                    <DrawerDescription style={{ color: "var(--qu-text-secondary)" }}>Manage this policy</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <CopyValueRow value={policy.id} title="Policy ID" />
                    <InputField label="Policy Name" value={name} setValue={setName} />
                    <InputField label="Policy Description" value={description} setValue={setDescription} />
                    <InputField label="Policy Type" value={type} setValue={setType} />
                    {/* <InputField label="Value" value={value} setValue={setValue} /> */}
                    <MonacoInput label="Value" value={value} setValue={setValue} />
                    <SwitchInput label="Enabled" value={policyEnabled} setValue={setPolicyEnabled} />
                </div>
                <Separator />
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button variant={"outline"} onClick={async () => {
                        await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/admin/policy/" + policy.id, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "accept": "application/json",
                                "Authorization": `Bearer ${auth.data?.sessionId}`,
                            },
                            body: JSON.stringify({
                                ...policy,
                                name,
                                description,
                                type,
                                value,
                                enabled: policyEnabled
                            }),
                        })
                        setOpen(false)
                        setTimeout(() => {
                            datahook.reload()
                        }, 2000)
                    }}><SaveIcon size={20} />Save</Button>
                    <Button variant={"outline"} onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function DeviceItem({ device, onClick }: { device: any, onClick?: () => void }) {
    return (
        <div className="flex flex-row items-center gap-2" onClick={onClick}>
            <div>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{device.displayName}</div>
                <div style={{ fontSize: "12px", color: "var(--qu-text-secondary)" }}>{device.name}</div>
            </div>
        </div>
    );
}

export function AddPolicyDrawer({ open, setOpen, datahook }: { open: boolean, setOpen: (open: boolean) => void, datahook: any }) {
    const auth = useAuth({ appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL! });
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [value, setValue] = useState("");
    const [deviceGroupId, setDeviceGroupId] = useState("");
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button style={{ color: "var(--qu-text)" }} variant="outline"><PlusIcon size={20} />Add Policy</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{ color: "var(--qu-text)", fontWeight: "500" }}>Create Policy</DrawerTitle>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <InputField label="Name" value={name} setValue={setName} />
                    <InputField label="Description" value={description} setValue={setDescription} />
                    <InputField label="Type" value={type} setValue={setType} />
                    {/* <InputField label="Value" value={value} setValue={setValue} /> */}
                    <MonacoInput label="Value" value={value} setValue={setValue} />
                    {datahook.loaded && <SelectField label="Device Group" value={deviceGroupId} setValue={setDeviceGroupId} options={datahook.data?.["/admin/devicegroups"].data} />}
                </div>
                <Separator />
                <DrawerFooter style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                    <Button style={{ color: "var(--qu-text)" }} variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button onClick={async () => {
                        await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/admin/policy", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "accept": "application/json",
                                "Authorization": `Bearer ${auth.data?.sessionId}`,
                            },
                            body: JSON.stringify({
                                name,
                                description,
                                type,
                                value,
                                deviceGroupId,
                            }),
                        });
                        setOpen(false);
                        setTimeout(() => {
                            datahook.reload();
                        }, 1000);
                    }}><CheckIcon size={20} />Add</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function CopyValueRow({ value, title }: { value: string, title: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{ padding: "20px 20px 0px 20px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", marginBottom: "10px" }}>{title}</div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <Input value={value} readOnly style={{ flex: 1, backgroundColor: "var(--header-background)", color: "var(--qu-text)" }} />
                <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(value);
                    setCopied(true);
                    setTimeout(() => {
                        setCopied(false);
                    }, 2000);
                }}>
                    {copied ? <><CheckIcon size={20} />Copied</> : <><ClipboardCopyIcon size={20} />Copy</>}
                </Button>
            </div>
        </div>
    );
}