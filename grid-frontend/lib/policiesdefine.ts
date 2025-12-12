import { ClockIcon, Icon, ImageIcon, LaptopIcon, MouseIcon, PaintbrushIcon, PinIcon, TerminalIcon } from "lucide-react";

export const policies = {
    types: {
        shell: {
            Icon: MouseIcon,
            name: "Shell",
            description: "Settings for the shell",
            types: {
                pinned: {
                    Icon: PinIcon,
                    policyname: "shell.pinned",
                    name: "Pinned",
                    description: "Applications that are pinned to the shell",
                    schema: {
                        type: "Object",
                        properties: {
                            apps: {
                                description: "Applications that are pinned to the shell",
                                title: "Applications",
                                type: "array",
                                items: {
                                    type: "string",
                                }

                            }
                        }
                    }
                },
                clockFormat: {
                    Icon: ClockIcon,
                    policyname: "shell.clockFormat",
                    name: "Clock Format",
                    description: "The format of the clock",
                    schema: {
                        type: "Object",
                        properties: {
                            format: {
                                description: "The format of the clock",
                                title: "Format",
                                type: "string",
                                enum: ["12h", "24h"],
                            }
                        }
                    }
                },
                colorScheme: {
                    Icon: PaintbrushIcon,
                    name: "Color Scheme",
                    description: "The color scheme of the shell",
                    policyname: "shell.colorScheme",
                    schema: {
                        type: "Object",
                        properties: {
                            colorScheme: {
                                description: "The color scheme of the shell",
                                title: "Scheme",
                                type: "string",
                                enum: ["prefer-dark", "default"],
                            }
                        }
                    }
                },

            }
        },
        desktop: {
            Icon: LaptopIcon,
            name: "Desktop",
            description: "Settings for the desktop",
            types: {
                wallpaper: {
                    Icon: ImageIcon,
                    name: "Wallpaper",
                    description: "The wallpaper of the desktop",
                    policyname: "desktop.wallpaper",
                    schema: {
                        type: "Object",
                        properties: {
                            url: {
                                description: "The URL of the wallpaper",
                                title: "URL",
                                type: "string",
                            },
                            id: {
                                description: "The unique identifier of the wallpaper",
                                title: "ID",
                                type: "string",
                            },
                            type: {
                                description: "The format of the wallpaper",
                                title: "Type",
                                type: "string",
                            }
                        }
                    }
                },

            }
        },
        command: {
            Icon: TerminalIcon,
            name: "Command",
            description: "Settings for commands",
            types: {
                run: {
                    Icon: TerminalIcon,
                    name: "Run",
                    policyname: "command.run",
                    description: "Run a command",
                    schema: {
                        type: "Object",
                        properties: {
                            command: {
                                description: "The command to run",
                                title: "Command",
                                type: "string",
                            }
                        }
                    }
                },

            }
        }
    }
}
