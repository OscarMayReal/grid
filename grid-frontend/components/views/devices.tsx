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
import { CheckIcon, ClipboardCopyIcon, MessageSquareIcon, PlusIcon, RotateCwIcon, SaveIcon, SearchIcon, XIcon } from "lucide-react";
import { InputField, PrefixedInput } from "@/components/fields";
import { useAuth } from "keystone-lib";
import { UserItem } from "@/components/header";
import { ConfirmDialog, InputDialog } from "@/components/confirmDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useRequests } from "@/lib/useRequests";

export function DeviceTable({datahook}: {datahook: any}) {
    const [domains, setDomains] = useState<any>([]);
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    useEffect(() => {
        if (datahook.loaded) {
            setDomains(datahook.data?.["/admin/devices"].data)
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
                header: "Online",
                accessorKey: "online",
            },
            {
                header: "Type",
                accessorKey: "type",
            },
            {
                header: "Last Seen",
                accessorKey: "changedStatusAt",
                cell: ({row}) => {
                    return row.original.online ? "Now" : new Date(row.original.changedStatusAt).toLocaleString();
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
                                        const req = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/admin/device/" + row.original.id + "/refreshpolicy", {
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
                                    <SendMessage device={row.original} auth={auth} />
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
            <DeviceInfoDrawer open={open} setOpen={setOpen} device={row.original} datahook={datahook} />
        </>
    );
}

function DeviceInfoDrawer({open, setOpen, device, datahook}: {open: boolean, setOpen: (open: boolean) => void, device: any, datahook: any}) {
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader style={{gap: "0px"}}>
                    <DrawerTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>{device.name}</DrawerTitle>
                    <DrawerDescription style={{color: "var(--qu-text-secondary)"}}>Manage this device</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Device Information</div>
                    <div style={{fontSize: "14px", fontWeight: "500", marginLeft: "20px", marginTop: "0px", color: "var(--qu-text-secondary)"}}>Information about this device</div>
                    <CopyValueRow value={device.id} title="Device ID" />
                    <CopyValueRow value={device.deviceToken} title="Device Token" />
                    <CopyValueRow value={device.os} title="OS" />
                    <CopyValueRow value={device.osVersion} title="OS Version" />
                    <CopyValueRow value={device.architecture} title="OS Architecture" />
                    {device.online && <><Separator style={{marginTop: "25px"}} />
                    <div style={{fontSize: "20px", fontWeight: "500", marginLeft: "20px", marginTop: "20px"}}>Installed Apps</div>
                    <div style={{fontSize: "14px", fontWeight: "500", marginLeft: "20px", marginTop: "0px", color: "var(--qu-text-secondary)"}}>Apps installed on this device</div></>}
                    {open && device.online && <InstalledAppList device={device} />}
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function InstalledAppList({device}: {device: any}) {
    const datahook = useRequests({
        requests: [
            {
                url: "/admin/device/name/" + device.name,
                resType: "json"
            }
        ],
    });
    if (!datahook.loaded) {
        return <div>Loading...</div>;
    }
    return <div className="p-3 flex flex-col gap-3 shadow-sm rounded-md bg-card m-[20px] separator-y-[#e4e4e7]">
        {datahook.data["/admin/device/name/" + device.name].data.flatpaks.filter((app: any) => app.kind == 0).map((app: any) => (
            <InstalledAppItem key={app.id} app={app} />
        ))}
    </div>;
}

export function InstalledAppItem({app}: {app: any}) {
    const appInfo = useRequests({
        requests: [
            {
                url: "/flathubproxy/compat/apps/" + app.appid,
                resType: "json"
            }
        ],
    });
    if (!appInfo.loaded) {
        return <div>Loading...</div>;
    }
    return (
        <div className="flex flex-row items-center gap-2">
            <img src={appInfo.data["/flathubproxy/compat/apps/" + app.appid].data.iconDesktopUrl} style={{
                width: "40px",
                height: "40px",
                borderRadius: "5px"
            }} />
            <div>
                <div style={{fontSize: "16px", fontWeight: "500"}}>{app.name || app.appid} v{app.version}</div>
                <div style={{fontSize: "12px", color: "var(--qu-text-secondary)"}}>{app.appid}</div>
            </div>
        </div>
    );
}

function SendMessage({device, auth}: {device: any, auth: any}) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    return <>
        <MessageSquareIcon size={18} style={{cursor: "pointer", color: "var(--qu-text)"}} onClick={() => setOpen(true)} />
        <InputDialog title="Send Message" description="Send a message to this device" isOpen={open} onClose={() => setOpen(false)} inputType="text" input={message} setInput={setMessage} onConfirm={async () => {
            const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/admin/device/" + device.id + "/sendmessage", {
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

export function DeviceItem({device, onClick, extra}: {device: any, onClick?: () => void, extra?: React.ReactNode}) {
    return (
        <div className="flex flex-row items-center gap-2" onClick={onClick}>
            <div>
                <div style={{fontSize: "16px", fontWeight: "500"}}>{device.displayName}</div>
                <div style={{fontSize: "12px", color: "var(--qu-text-secondary)"}}>{device.name}</div>
            </div>
            <div style={{flex: 1}}/>
            {extra}
        </div>
    );
}

export function AddDeviceDrawer({open, setOpen, datahook}: {open: boolean, setOpen: (open: boolean) => void, datahook: any}) {
    const auth = useAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState("");
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button style={{color: "var(--qu-text)"}} variant="outline"><PlusIcon size={20} />Add Device</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>Add Device</DrawerTitle>
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
                        await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/admin/device", {
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