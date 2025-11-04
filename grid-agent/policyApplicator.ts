import { DesktopPolicyApplier } from "./policy/desktop.ts";
import { ShellPolicyApplier } from "./policy/shell.ts";

export async function applyPolicy(policies: any[]) {
    for (const policy of policies) {
        if (policy.type.startsWith("desktop.")) {
            await DesktopPolicyApplier(policy);
        } else if (policy.type.startsWith("shell.")) {
            await ShellPolicyApplier(policy);
        }
    }
}
