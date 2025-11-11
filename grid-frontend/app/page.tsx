import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { LogInIcon } from "lucide-react";

export default function Home() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      width: "100vw",
      top: 0,
      position: "fixed",
      gap: 10,
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 className="text-4xl" style={{
        color: "var(--qu-color-foreground)"
      }}>Quntem Grid</h1>
      <p className="text-lg">Simple device management</p>
      <div className="flex flex-row items-center gap-3">
        <a href="https://keystone.qplus.cloud/acquireapp/cmhtpjr9g006hx9qcfuk70cwb"><Button variant="outline"><SparklesIcon /> Get Started</Button></a>
        <a href="/admin"><Button variant="outline"><LogInIcon /> Login</Button></a>
      </div>
    </div>
  );
}
