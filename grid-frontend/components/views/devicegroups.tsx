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
import { InputField, PrefixedInput } from "@/components/fields";
import { useAuth } from "keystone-lib";
import { UserItem } from "@/components/header";
import { ConfirmDialog } from "@/components/confirmDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function DeviceGroupTable({datahook}: {datahook: any}) {
    const [domains, setDomains] = useState<any>([]);
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
                header: "Device Amount",
                accessorKey: "deviceAmount",
            },
            {
                header: "Created At",
                accessorKey: "createdAt",
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
            <DeviceGroupInfoDrawer open={open} setOpen={setOpen} deviceGroup={row.original} datahook={datahook} />
        </>
    );
}

function DeviceGroupInfoDrawer({open, setOpen, deviceGroup, datahook}: {open: boolean, setOpen: (open: boolean) => void, deviceGroup: any, datahook: any}) {
    return (
        <Drawer handleOnly direction="right" open={open} onOpenChange={setOpen}>
            <DrawerContent>
                <DrawerHeader style={{gap: "0px"}}>
                    <DrawerTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>{deviceGroup.name}</DrawerTitle>
                    <DrawerDescription style={{color: "var(--qu-text-secondary)"}}>Manage this device group</DrawerDescription>
                </DrawerHeader>
                <Separator />
                <div className="drawer-mainarea">
                    <CopyValueRow value={deviceGroup.id} title="Device Group ID" />
                </div>
                <Separator />
                <DrawerFooter style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Button onClick={() => setOpen(false)}><XIcon size={20} />Close</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function AddDeviceGroupDrawer({open, setOpen, datahook}: {open: boolean, setOpen: (open: boolean) => void, datahook: any}) {
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
                    <InputField label="Name" value={name} setValue={setName} />
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