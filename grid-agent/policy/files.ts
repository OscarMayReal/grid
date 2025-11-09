import { exec } from "child_process";
export async function FilesPolicyApplier(policy: any) {
    if (policy.type === "files.showHiddenFiles") {
        const policyContent = await JSON.parse(policy.value);
        // console.log(JSON.stringify(policyContent.apps));
        exec("gsettings set org.gnome.nautilus.preferences show-hidden-files \"" + policyContent.showHiddenFiles + "\"", (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(error);
            }
            if (stderr) {
                console.error(stderr);
            }
            console.log(stdout);
        });
    }
}