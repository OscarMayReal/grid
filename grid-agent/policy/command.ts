import { exec } from "child_process";
export async function CommandPolicyApplier(policy: any) {
    if (policy.type === "command.run") {
        const policyContent = await JSON.parse(policy.value);
        exec(policyContent.command, (error: any, stdout: any, stderr: any) => {
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
