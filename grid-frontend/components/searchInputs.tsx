import { getDeviceByName } from "@/lib/admin";
import { useAuth } from "keystone-lib";
import { useState } from "react";
import { DeviceItem } from "@/components/views/devices";
import { Button } from "./ui/button";
import { SearchIcon } from "lucide-react";

export function DeviceSearchInput({onDeviceSelect}: {onDeviceSelect: (device: any) => any}) {
    const auth = useAuth({
        appId: process.env.NEXT_PUBLIC_APP_ID!,
        keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!,
    });
    const [value, setValue] = useState("");
    const [device, setDevice] = useState<any>(null);
    return (
        <div style={{padding: "20px 20px 0px 20px"}}>
            <div style={{fontSize: "14px", fontWeight: "500", marginBottom: "10px"}}>Find User</div>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "10px"}}>
                <div className="flex items-center border border-input rounded-md shadow-xs bg-background focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow] px-3 h-9 text-base w-full">
                    <span style={{color: "var(--qu-text-secondary)"}} className="select-none text-[14px]">{auth?.data?.tenant.name + "/"}</span>
                    <input type="text" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            getDeviceByName(value).then((data) => {
                                if (data?.error) {
                                    console.log(data.error);
                                    setDevice(null);
                                } else {
                                    setDevice(data);
                                }
                            });
                        }
                    }} className="outline-none text-[14px] w-full" />
                </div>
                <Button variant="outline" onClick={() => {
                    getDeviceByName(value).then((data) => {
                        if (data?.error) {
                            console.log(data.error);
                            setDevice(null);
                        } else {
                            setDevice(data);
                        }
                    });
                }}><SearchIcon size={20} />Search</Button>
            </div>
            {device?.id && <div className="border border-input rounded-md shadow-xs bg-background p-2 mt-[10px] hover:bg-input/50 cursor-pointer transition-all">
                <DeviceItem device={device} onClick={() => {
                    onDeviceSelect(device);
                    setDevice(null);
                    setValue("");
                }} />
            </div>}
        </div>
    );
}