"use client"
import { Button } from "@/components/ui/button";
import { useRequests } from "@/lib/useRequests";
import { ArrowDownToLineIcon, StopCircleIcon } from "lucide-react";
import { use } from "react";

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
        <img src={datahook.data["/compat/apps/" + Params.appid].data.screenshots[0].thumbUrl} alt={datahook.data["/compat/apps/" + Params.appid].data.name} />
    </div>;
}

export function AppHeader({app}: {app: any}) {
    return <div>
        <div className="page-header gap-[20px] px-[25px] pt-[15px]" style={{justifyContent: "flex-start"}}>
            <img src={app.iconDesktopUrl} style={{
                width: "40px",
                height: "40px",
            }} alt={app.name} />
            <div>
                <div className="page-header-title">{app.name}</div>
                <div className="page-header-subtitle">{app.summary}</div>
            </div>
        </div>
        <div className="px-[25px] pb-[15px] gap-[15px] flex flex-row">
            <Button variant="outline"><ArrowDownToLineIcon />Add to Group</Button>
            <Button variant="outline"><StopCircleIcon />Block on managed devices</Button>
        </div>
    </div>
}