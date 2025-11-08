"use client"
import { SelectField } from "@/components/fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRequests } from "@/lib/useRequests";
import { getAuth } from "keystone-lib";
import { ArrowDownToLineIcon, StopCircleIcon, XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { use } from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function AppPage({params}: {params: {appid: string}}) {
    const Params = use(params);
    const datahook = useRequests({
        requests: [
            {
                url: "/compat/apps/" + Params.appid,
                resType: "json"
            }
        ],
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL! + "/flathubproxy",
        noAuth: true
    });
    if (!datahook.loaded) {
        return null;
    }
    return <div>
        <AppHeader app={datahook.data["/compat/apps/" + Params.appid].data} />
        <div className="px-[25px]">
            <div style={{
                color: "var(--qu-text-secondary)",
                marginBottom: "5px"
            }}>Description</div>
            <div style={{
                color: "var(--qu-text)"
            }} dangerouslySetInnerHTML={{__html: datahook.data["/compat/apps/" + Params.appid].data.description}} />
        </div>
    </div>;
}

export function AppHeader({app}: {app: any}) {
    const datahook = useRequests({
        requests: [
            {
                url: "/devicegroups",
                resType: "json"
            },
            {
                url: "/appid/" + app.flatpakAppId,
                resType: "json"
            }
        ],
        baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL! + "/admin",
    });
    const [selectedGroup, setSelectedGroup] = useState("");
    const [open, setOpen] = useState(false);
    return <div>
        <div className="page-header gap-[20px] px-[25px] pt-[15px] min-w-[0px]" style={{justifyContent: "flex-start"}}>
            <img src={app.iconDesktopUrl} style={{
                width: "40px",
                height: "40px",
            }} alt={app.name} />
            <div className="min-w-[0px]">
                <div className="page-header-title">{app.name}</div>
                <div className="page-header-subtitle" style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>{app.summary}</div>
            </div>
        </div>
        <div className="px-[25px] pb-[15px] gap-[15px] flex flex-row">
            {datahook.loaded && <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button style={{
                        color: "var(--qu-text)"
                    }} variant="outline"><ArrowDownToLineIcon />Add to Group</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle style={{color: "var(--qu-text)", fontWeight: "500"}}>Add {app.name} to Group</DialogTitle>
                        <DialogDescription style={{color: "var(--qu-text-secondary)"}}>
                            Install {app.name} on managed devices in the selected group
                        </DialogDescription>
                    </DialogHeader>
                    <SelectField noMargin label=" " value={selectedGroup} setValue={setSelectedGroup} options={datahook.data["/devicegroups"].data.map((group: any) => ({
                            id: group.id,
                            name: datahook.data["/appid/" + app.flatpakAppId].data.some((app: any) => app.assignedToGroupId === group.id) ? group.name + " (Installed)" : group.name,
                            description: group.description,
                            disabled: datahook.data["/appid/" + app.flatpakAppId].data.some((app: any) => app.assignedToGroupId === group.id)
                    }))} />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" style={{color: "var(--qu-text)"}}><XIcon size={20} />Cancel</Button>
                        </DialogClose>
                        <Button variant="outline" style={{color: "var(--qu-text)"}} onClick={async () => {
                            var auth = await getAuth({appId: process.env.NEXT_PUBLIC_APP_ID!, keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!});
                            const req = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/admin/app", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "accept": "application/json",
                                    "Authorization": `Bearer ${auth.data?.sessionId}`,
                                },
                                body: JSON.stringify({
                                    appId: app.flatpakAppId,
                                    name: app.name,
                                    assignedToGroupId: selectedGroup,
                                }),
                            });
                            if (req.ok) {
                                toast.success("App installed successfully");
                                setSelectedGroup("");
                                setOpen(false);
                                setTimeout(() => {
                                    datahook.reload();
                                }, 2000);
                            } else {
                                toast.error("Failed to install app");
                            }
                        }}><ArrowDownToLineIcon size={20} />Install</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>}
            <Button style={{
                color: "var(--qu-text)"
            }} variant="outline"><StopCircleIcon />Block on managed devices</Button>
        </div>
    </div>
}