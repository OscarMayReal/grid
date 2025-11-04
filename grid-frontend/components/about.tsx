"use client"

import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./ui/dialog";

export function About({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <img src="/logo.svg" className="header-logo" style={{objectFit: "contain", height: "30px", width: "fit-content", marginLeft: "0px"}} />
                    <DialogTitle>About Grid</DialogTitle>
                    <DialogDescription>Version {process.env.NEXT_PUBLIC_APP_VERSION}</DialogDescription>
                </DialogHeader>
                <div>Grid is an application for managing a large amount of linux devices easily.</div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline"><XIcon />Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}