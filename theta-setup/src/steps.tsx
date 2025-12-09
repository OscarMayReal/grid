import { Button } from "./components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "./components/ui/card";
import { SetupContext, StepsEnum } from "./App";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon, GlobeIcon, LaptopMinimalIcon, SparklesIcon, UnlockIcon, Wifi, WifiIcon, WifiZeroIcon } from "lucide-react";
import { Input } from "./components/ui/input";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Item, ItemDescription, ItemGroup, ItemTitle } from "./components/ui/item";
import type { ConnectionOpts, WiFiNetwork } from "node-wifi";
import { Separator } from "./components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";

export function InitStep() {
    const { step, setStep } = useContext(SetupContext)
    return (
        <>
            <CardHeader>
                <CardTitle>
                    ThetaOS Setup
                </CardTitle>
                <CardDescription>
                    Set up your new device
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className="w-full h-full flex items-center justify-center gap-10">
                    <div className="flex flex-col gap-2 w-[382px]">
                        <SparklesIcon />
                        <div className="text-xl font-semibold">Welcome to ThetaOS</div>
                        <div className="text-sm text-muted-foreground">The powerful and secure operating system for your device</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => setStep(StepsEnum.network)}><ArrowRightIcon /> Get Started</Button>
            </CardFooter>
        </>
    )
}

export function NetworkStep() {
    const [networks, setNetworks] = useState<WiFiNetwork[]>([])
    const [currentNetwork, setCurrentNetwork] = useState<WiFiNetwork | null>(null)
    const { step, setStep } = useContext(SetupContext)
    useEffect(() => {
        window.wifi.scan().then((networks) => {
            var tempnetworks: WiFiNetwork[] = []
            networks.forEach((network) => {
                if (network.ssid !== "" && tempnetworks.find((tempnetwork) => tempnetwork.ssid === network.ssid) === undefined) {
                    tempnetworks.push(network)
                }
            })
            setNetworks(tempnetworks)
            window.wifi.getCurrentConnections().then((connections) => {
                setCurrentNetwork(connections?.[0])
            })
        })
    }, [])
    return (
        <>
            <CardHeader>
                <CardTitle>
                    Networking
                </CardTitle>
                <CardDescription>
                    Get connected to a network
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className="w-full h-full flex items-center justify-center gap-10">
                    {window.navigator.onLine && currentNetwork ? <>
                        <div className="flex flex-col gap-2 max-w-[382px]">
                            <GlobeIcon />
                            <div className="text-xl font-semibold">Connected to {currentNetwork?.ssid}</div>
                            <div className="text-sm text-muted-foreground">You have a network connection</div>
                        </div>
                    </> : !window.navigator.onLine ? <>
                        <div className="flex flex-col gap-2 max-w-[382px]">
                            <GlobeIcon />
                            <div className="text-xl font-semibold">Connect to a Network</div>
                            <div className="text-sm text-muted-foreground">A network connection is required to continue</div>
                        </div>
                        <Accordion className="border-1 rounded-md" type="single" collapsible style={{ width: "382px" }}>
                            {networks.map((network, index) => (
                                <NetworkItem network={network} onConnect={() => {
                                    window.wifi.getCurrentConnections().then((connections) => {
                                        setCurrentNetwork(connections?.[0])
                                    })
                                }} />
                            ))}
                        </Accordion>
                    </> : navigator.onLine ? <>
                        <div className="flex flex-col gap-2 max-w-[382px]">
                            <CheckIcon />
                            <div className="text-xl font-semibold">Connected to the internet</div>
                            <div className="text-sm text-muted-foreground">You have a network connection</div>
                        </div>
                    </> : null}
                </div>
            </CardContent>
            {navigator.onLine && <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => setStep(StepsEnum.deviceUse)}><ArrowRightIcon /> Continue</Button>
            </CardFooter>}
        </>
    )
}

function NetworkItem({ network, onConnect }: { network: WiFiNetwork, onConnect: (network: WiFiNetwork) => void }) {
    const [password, setPassword] = useState("")
    return (
        <AccordionItem style={{ overflow: "hidden" }} value={network.ssid} className="px-4">
            <AccordionTrigger className="flex flex-row items-center justify-start gap-2">
                {network.security === "WPA" || network.security === "WPA2" || network.security === "WPA3" ? <WifiIcon style={{ rotate: "0deg" }} size={16} /> : <UnlockIcon style={{ rotate: "0deg" }} size={16} />}<div>{network.ssid}</div>
                <div className="flex-1" />
                <div>{network.signal_level}</div>
            </AccordionTrigger>
            <AccordionContent style={{ overflow: "visible" }}>
                <div className="flex flex-row items-center justify-start gap-2">
                    {network.security === "WPA" || network.security === "WPA2" || network.security === "WPA3" ? <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /> : null}
                    <Button onClick={() => {
                        window.wifi.connect({
                            ssid: network.ssid,
                            password: password
                        } as ConnectionOpts).then(() => {
                            onConnect(network)
                        })
                    }} className={network.security === "WPA" || network.security === "WPA2" || network.security === "WPA3" ? "" : "flex-1"} variant={"outline"}><ArrowRightIcon />Connect</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

export function DeviceUseStep() {
    const { step, setStep } = useContext(SetupContext)
    return (
        <>
            <CardHeader>
                <CardTitle>
                    Device Use
                </CardTitle>
                <CardDescription>
                    Choose how this device will be used
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className="w-full h-full flex items-center justify-center gap-10">
                    <div className="flex flex-col gap-2 w-[382px]">
                        <LaptopMinimalIcon />
                        <div className="text-xl font-semibold">How will this device be used?</div>
                        <div className="text-sm text-muted-foreground">This will determine the level of access and control you have over this device</div>
                    </div>
                    <RadioGroup className='w-full max-w-96 gap-2' defaultValue='1'>
                        <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-2 rounded-md border p-4 shadow-xs outline-none'>
                            <RadioGroupItem
                                value='1'
                                id={`1`}
                                aria-label='plan-radio-basic'
                                aria-describedby={`1-description`}
                                className='size-5 after:absolute after:inset-0 [&_svg]:size-3'
                            />
                            <div className='grid grow gap-2'>
                                <Label htmlFor={`1`} className='justify-between'>
                                    Personal Use
                                </Label>
                                <p id={`1-description`} className='text-muted-foreground text-xs'>
                                    Link with a personal account with full control
                                </p>
                            </div>
                        </div>

                        <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-2 rounded-md border p-4 shadow-xs outline-none'>
                            <RadioGroupItem
                                value='2'
                                id={`2`}
                                aria-describedby={`2-description`}
                                className='size-5 after:absolute after:inset-0 [&_svg]:size-3'
                            />
                            <div className='grid grow gap-2'>
                                <Label htmlFor={`2`} className='justify-between'>
                                    ThetaOS Business
                                </Label>
                                <p id={`2-description`} className='text-muted-foreground text-xs'>
                                    Manage this device with Quntem Grid
                                </p>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => setStep(StepsEnum.account)}><ArrowRightIcon /> Continue</Button>
            </CardFooter>
        </>
    )
}

export function AccountStep() {
    const { step, setStep } = useContext(SetupContext)
    const [stage, setStage] = useState("signin")
    const authFrame = useRef<HTMLIFrameElement>(null)
    useEffect(() => {
        if (authFrame.current) {
            console.log("got frame")
            window.addEventListener("message", (event) => {
                console.log(event.data)
                if (event.data === "signin") {
                    setStage("welcome")
                }
            })
        }
    }, [stage, setStage])
    return (
        <>
            <CardHeader>
                <CardTitle>
                    Account
                </CardTitle>
                <CardDescription>
                    Sign in with your Quntem Account
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                {/* {stage === "signin" && <QuntemAccountSignIn setStage={setStage} />} */}
                {stage === "signin" && <iframe ref={authFrame} className="w-full h-full rounded-md" src="https://keystoneapi.qplus.cloud/auth/signin?redirectTo=https://theta-setup-redir.netlify.app" />}
                {stage === "welcome" && <AccountWelcome />}
            </CardContent>
            {stage === "welcome" && <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => setStep(StepsEnum.deviceUse)}><ArrowRightIcon /> Continue</Button>
            </CardFooter>}
        </>
    )
}

function AccountWelcome() {
    const [user, setUser] = useState(null)
    useEffect(() => {
        fetch("https://keystoneapi.qplus.cloud/auth/getsession", {
            credentials: "include",
            redirect: "manual"
        }).then((res) => res.json()).then((data) => {
            setUser(data)
        })
    }, [])
    if (!user) {
        return <div>Loading...</div>
    }
    return (
        <div className="flex flex-col items-center justify-center h-full gap-2">
            <Avatar className="w-15 h-15">
                <AvatarFallback className="text-2xl">{user.user?.name.split("")[0].toUpperCase() + user.user?.name.split("")[1].toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">Welcome {user.user?.name}</h1>
            <p className="text-lg">{user.user?.email}</p>
            <p>{user.user?.tenant?.id ? "Managed Quntem Account (" + user.user.tenant.name + ")" : "Personal Quntem Account"}</p>
        </div>
    )
}