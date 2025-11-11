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
import { CheckIcon, ClipboardCopyIcon, MessageSquareIcon, PlusIcon, SaveIcon, SearchIcon, XIcon } from "lucide-react";
import { InputField, PrefixedInput } from "@/components/fields";
import { useAuth } from "keystone-lib";
import { UserItem } from "@/components/header";
import { ConfirmDialog, InputDialog } from "@/components/confirmDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DeviceItem } from "./devices";
import { DeviceSearchInput } from "../searchInputs";
import { addDeviceToGroup, removeAppFromGroup, removeDeviceFromGroup } from "@/lib/admin";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { RotateCwIcon } from "lucide-react";
import { useRequests } from "@/lib/useRequests";

export function DeviceGroupTable({datahook}: {datahook: any}) {
    const [domains, setDomains] = useState<any>([]);
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    useEffect(() => {
        if (datahook.loaded) {
            setDomains(datahook.data?.["/admin/devicegroups"].data.map((group: any) => ({
                ...group,
                deviceAmount: group._count.deviceGroupDevices,
            })))
        }
    }, [datahook]);
    const table = useReactTable({
        data: domains,
        columns: [
            {
                header: "Name",
                accessorKey: "name",
            },
            {
                header: "Device Count",
                accessorKey: "deviceAmount",
            },
            {
                header: "Created At",
                accessorKey: "createdAt",
                cell: ({row}) => {
                    return (
                        <div>{new Date(row.original.createdAt).toLocaleString()}</div>
                    );
                },
            },
            {
                header: "Actions",
                cell: ({row}) => {
                    return (
                        <div className="flex flex-row items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <RotateCwIcon size={18} style={{cursor: "pointer", color: "var(--qu-text)"}} onClick={async (e) => {
                                        e.stopPropagation();
                                        const req = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/admin/deviceGroup/" + row.original.id + "/refreshpolicy", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "accept": "application/json",
                                                "Authorization": `Bearer ${auth.data?.sessionId}`,
                                            },
                                        });
                                        if (req.ok) {
                                            toast.success("Policy refresh started for " + auth.data?.tenant.name + "/" + row.original.name);
                                        } else {
                                            toast.error("Failed to start policy refresh for " + auth.data?.tenant.name + "/" + row.original.name);
                                        }
                                    }} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Refresh Policies
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    <SendMessage deviceGroup={row.original} auth={auth} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    Send Message
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    );
                },
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
                        <TableRowWithDrawer key={row.id} row={row} datahook={datahook} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function SendMessage({deviceGroup, auth}: {deviceGroup: any, auth: any}) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    return <>
        <MessageSquareIcon size={18} style={{cursor: "pointer", color: "var(--qu-text)"}} onClick={() => setOpen(true)} />
        <InputDialog title="Send Message" description="Send a message to all devices in this group" isOpen={open} onClose={() => setOpen(false)} inputType="text" input={message} setInput={setMessage} onConfirm={async () => {
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/admin/deviceGroup/" + deviceGroup.id + "/sendmessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${auth.data?.sessionId}`,
                },
                body: JSON.stringify({
                    message: message,
                }),
            });
            if (!response.ok) {
                toast.error("Failed to send message");
                return;
            }
            toast.success("Message sent");
            setOpen(false);
            setMessage("");
        }} />
    </>
}

const TableRowWithDrawer = ({row, datahook}: {row: Row<any>, datahook: any}) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} onClick={() => setOpen(true)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
            <DeviceGroupInfoDrawer open={open} setOpen={setOpen} deviceGroup={row.original} datahook={datahook} />
        </>
    );
}

function DeviceGroupInfoDrawer({open, setOpen, deviceGroup, datahook}: {open: boolean, setOpen: (open: boolean) => void, deviceGroup: any, datahook: any}) {
    const [deviceGroupDevices, setDeviceGroupDevices] = useState(deviceGroup.deviceGroupDevices)
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader style={{gap: "0px"}}>
                    <DrawerTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>{deviceGroup.name}</DrawerTitle>
                    <DrawerDescription style={{color: "var(--qu-text-secondary)"}}>Manage this device group</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Group Info</div>
                    <div style={{fontSize: "14px", fontWeight: "500", marginLeft: "20px", marginTop: "0px", color: "var(--qu-text-secondary)"}}>Information about this device group</div>
                    <CopyValueRow value={deviceGroup.id} title="Device Group ID" />

                    <Separator style={{marginTop: "25px"}} />
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Devices</div>
                    <div style={{fontSize: "14px", fontWeight: "500", marginLeft: "20px", marginTop: "0px", color: "var(--qu-text-secondary)"}}>Devices in this group</div>
                    <DeviceSearchInput onDeviceSelect={async (device) => {
                        console.log(device);
                        const newdevice = await addDeviceToGroup(device.id, deviceGroup.id);
                        console.log(newdevice);
                        setDeviceGroupDevices([...deviceGroupDevices, newdevice]);
                    }} />
                    <div className="p-3 flex flex-col gap-3 shadow-sm rounded-md bg-card m-[20px] separator-y-[#e4e4e7]">
                        {deviceGroupDevices.map((deviceGroupDevice: any) => (
                            <DeviceItem extra={<Button variant="outline" onClick={() => {
                                removeDeviceFromGroup(deviceGroupDevice.device.id, deviceGroup.id);
                                setDeviceGroupDevices(deviceGroupDevices.filter((deviceGroupDevice: any) => deviceGroupDevice.device.id !== deviceGroupDevice.device.id));
                            }}><XIcon size={20} /></Button>} key={deviceGroupDevice.id} device={deviceGroupDevice.device} />
                        ))}
                    </div>
                    <Separator style={{marginTop: "25px"}} />
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Apps</div>
                    <div style={{fontSize: "14px", fontWeight: "500", marginLeft: "20px", marginTop: "0px", color: "var(--qu-text-secondary)"}}>Apps assigned to this group</div>
                    {open && <AppList deviceGroup={deviceGroup} />}
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function AppItem({app, extra}: {app: any, extra?: React.ReactNode}) {
    const appInfo = useRequests({
        requests: [
            {
                url: "/flathubproxy/compat/apps/" + app.appId,
                resType: "json"
            }
        ],
    });
    if (!appInfo.loaded) {
        return <div>Loading...</div>;
    }
    return (
        <div className="flex flex-row items-center gap-2">
            <img src={appInfo.data["/flathubproxy/compat/apps/" + app.appId].data.iconDesktopUrl} style={{
                width: "40px",
                height: "40px",
                borderRadius: "5px"
            }} />
            <div className="min-w-0">
                <div style={{fontSize: "16px", fontWeight: "500"}}>{app.name || app.appId}</div>
                <div style={{fontSize: "12px", color: "var(--qu-text-secondary)"}}>{app.appId}</div>
            </div>
            <div style={{flex: 1}} />
            {extra}
        </div>
    );
}

export function AppList({deviceGroup}: {deviceGroup: any}) {
    const requests = useRequests({
        requests: [
            {
                url: "/admin/devicegroup/" + deviceGroup.id + "/apps",
                resType: "json"
            }
        ],
    });
    if (!requests.loaded) {
        return <div>Loading...</div>;
    }
    return <div className="p-3 flex flex-col gap-3 shadow-sm rounded-md bg-card m-[20px] separator-y-[#e4e4e7]">
        {requests.data["/admin/devicegroup/" + deviceGroup.id + "/apps"].data.map((app: any) => (
            <AppItem extra={<Button variant="outline" onClick={async () => {
                await removeAppFromGroup(app.id);
                toast.success("App removed from group");
                requests.reload();
            }}><XIcon size={20} /></Button>} key={app.id} app={app} />
        ))}
    </div>;
}

export function AddDeviceGroupDrawer({open, setOpen, datahook}: {open: boolean, setOpen: (open: boolean) => void, datahook: any}) {
    const [displayName, setDisplayName] = useState("");
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    const [name, setName] = useState("");
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button style={{color: "var(--qu-text)"}} variant="outline"><PlusIcon size={20} />Add Device Group</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>Add Device Group</DrawerTitle>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <PrefixedInput prefix={auth.data?.tenant.name + "/"} label="Name" value={name} setValue={setName} />
                    <InputField label="Display Name" value={displayName} setValue={setDisplayName} />
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button style={{color: "var(--qu-text)"}} variant="outline" onClick={() => setOpen(false)}><XIcon size={20} />Cancel</Button>
                    <Button onClick={async () => {
                        await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/admin/devicegroup", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "accept": "application/json",
                                "Authorization": `Bearer ${auth.data?.sessionId}`,
                            },
                            body: JSON.stringify({
                                name,
                                displayName,
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

export function CopyValueRow({value, title}: {value: string, title: string}) {
    const [copied, setCopied] = useState(false);
    return (
        <div style={{padding: "20px 20px 0px 20px"}}>
            <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>{title}</div>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
                <Input value={value} readOnly style={{flex: 1, backgroundColor: "var(--header-background)", color: "var(--qu-text)"}} />
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