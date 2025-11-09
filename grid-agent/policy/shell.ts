import { exec } from "child_process";
export async function ShellPolicyApplier(policy: any) {
    if (policy.type === "shell.pinned") {
        const policyContent = await JSON.parse(policy.value);
        // console.log(JSON.stringify(policyContent.apps));
        exec("gsettings set org.gnome.shell favorite-apps \"" + JSON.stringify(policyContent.apps).replaceAll("\"", "\\\"") + "\"", (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(error);
            }
            if (stderr) {
                console.error(stderr);
            }
            console.log(stdout);
        });
    } else if (policy.type === "shell.clockFormat") {
        const policyContent = await JSON.parse(policy.value);
        exec("gsettings set org.gnome.desktop.interface clock-format \"" + policyContent.format + "\"", (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(error);
            }
            if (stderr) {
                console.error(stderr);
            }
            console.log(stdout);
        });
    } else if (policy.type === "shell.colorScheme") {
        const policyContent = await JSON.parse(policy.value);
        exec("gsettings set org.gnome.desktop.interface color-scheme \"" + policyContent.colorScheme + "\"", (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(error);
            }
            if (stderr) {
                console.error(stderr);
            }
            console.log(stdout);
        });
    } else {
        console.log("Unsupported policy type: " + policy.type);
    }
}