import { DesktopPolicyApplier } from "./policy/desktop.ts";
import { ShellPolicyApplier } from "./policy/shell.ts";
import { CommandPolicyApplier } from "./policy/command.ts";
import { FilesPolicyApplier } from "./policy/files.ts";

export async function applyPolicy(policies: any[]) {
    var applied = 0
    for (const policy of policies) {
        if (policy.enabled) {
            console.log("Starting Application for \"" + policy.name + "\" (" + policy.type + ")");
            if (policy.type.startsWith("desktop.")) {
                await DesktopPolicyApplier(policy);
            } else if (policy.type.startsWith("shell.")) {
                await ShellPolicyApplier(policy);
            } else if (policy.type.startsWith("command.")) {
                await CommandPolicyApplier(policy);
            } else if (policy.type.startsWith("files.")) {
                await FilesPolicyApplier(policy);
            }
            applied += 1
        } else {
            console.log("Skipping Application for \"" + policy.name + "\" (" + policy.type + ") because it is disabled");
        }
    }
    return {
        count: applied
    }
}
