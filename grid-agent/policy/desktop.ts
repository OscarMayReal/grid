import * as wallpaper from "wallpaper";
import download from "download";

export async function DesktopPolicyApplier(policy: any) {
    if (policy.type === "desktop.wallpaper") {
        const policyContent = await JSON.parse(policy.value);
        const file = await download(policyContent.url, "./download", {
            filename: "wallpaperpolicy_" + policyContent.id + "." + policyContent.type,
        });
        await wallpaper.setWallpaper("./download/wallpaperpolicy_" + policyContent.id + "." + policyContent.type);
    }
}
