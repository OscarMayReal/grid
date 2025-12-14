import { Button } from "./components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "./components/ui/card";
import { SetupContext, StepsEnum } from "./App";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, BuildingIcon, CheckIcon, GlobeIcon, Grid2X2Icon, Grid2X2XIcon, LaptopMinimalIcon, LogOutIcon, SparklesIcon, UnlockIcon, UserIcon, Wifi, WifiIcon, WifiZeroIcon } from "lucide-react";
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
    const { step, setStep, gridConfig, setGridConfig, tenantInfo, setTenantInfo } = useContext(SetupContext)
    useEffect(() => {
        console.log(window.os.homeDir() + "/config.json")
        window.fs.access(window.os.homeDir() + "/config.json").then(() => {
            window.fs.readFile(window.os.homeDir() + "/config.json").then((data) => {
                console.log(data)
                setGridConfig(JSON.parse(data.toString()))
                var localgridconfig = JSON.parse(data.toString())
                fetch(localgridconfig["serverUrl"] + "/info/tenant/fromdevice?deviceId=" + localgridconfig["deviceId"] + "&deviceToken=" + localgridconfig["deviceToken"]).then((res) => {
                    res.json().then((data) => {
                        console.log(data.tenant)
                        setTenantInfo(data.tenant)
                    })
                })
            })
        }).catch(() => {
            return
        })
    }, [setGridConfig, setTenantInfo])
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
                <Button onClick={() => setStep(tenantInfo?.id ? StepsEnum.enrollInfo : StepsEnum.network)}><ArrowRightIcon /> Get Started</Button>
            </CardFooter>
        </>
    )
}

export function EnrollInfoStep() {
    const { step, setStep, gridConfig, setGridConfig, tenantInfo, setTenantInfo } = useContext(SetupContext)
    return (
        <>
            <CardHeader>
                <CardTitle>
                    Enrollment Information
                </CardTitle>
                <CardDescription>
                    Enter your enrollment information
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className="w-full h-full flex items-center justify-center gap-10">
                    <div className="flex flex-col gap-2 max-w-[382px]">
                        <div className="flex flex-row items-center gap-2">
                            <BuildingIcon className="flex-shrink-0" />
                        </div>
                        <div className="text-xl font-semibold">This device is managed by {tenantInfo["displayName"] || tenantInfo["name"]}</div>
                        <div className="text-sm text-muted-foreground">Your IT administrator will be able to manage this device</div>
                        <img src={tenantInfo["logo"]} className="w-fit h-[30px]" alt="" />
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
    const { step, setStep, tenantInfo, setSelectedMode, setGridConfig } = useContext(SetupContext)
    const [deviceUse, setDeviceUse] = useState(tenantInfo?.id ? "business" : "personal")
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
                    <RadioGroup value={deviceUse} onValueChange={setDeviceUse} className='w-full max-w-96 gap-2' defaultValue='personal'>
                        {!tenantInfo?.id && <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-2 rounded-md border p-4 shadow-xs outline-none'>
                            <RadioGroupItem
                                value='personal'
                                id={`personal`}
                                aria-label='plan-radio-basic'
                                aria-describedby={`personal-description`}
                                className='size-5 after:absolute after:inset-0 [&_svg]:size-3'
                            />
                            <div className='grid grow gap-2'>
                                <Label htmlFor={`personal`} className='justify-between'>
                                    Personal Use
                                </Label>
                                <p id={`personal-description`} className='text-muted-foreground text-xs'>
                                    Link with a personal account with full control
                                </p>
                            </div>
                        </div>}

                        <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-2 rounded-md border p-4 shadow-xs outline-none'>
                            <RadioGroupItem
                                value='business'
                                id={`business`}
                                aria-describedby={`business-description`}
                                className='size-5 after:absolute after:inset-0 [&_svg]:size-3'
                            />
                            <div className='grid grow gap-2'>
                                <Label htmlFor={`business`} className='justify-between'>
                                    ThetaOS Business
                                </Label>
                                <p id={`business-description`} className='text-muted-foreground text-xs'>
                                    Sign in with your business account
                                </p>
                            </div>
                        </div>

                        {tenantInfo?.id && <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-2 rounded-md border p-4 shadow-xs outline-none'>
                            <RadioGroupItem
                                value='business'
                                id={`business`}
                                aria-describedby={`business-description`}
                                className='size-5 after:absolute after:inset-0 [&_svg]:size-3'
                            />
                            <div className='grid grow gap-2'>
                                <Label htmlFor={`business`} className='justify-between'>
                                    ThetaOS Business (Signed Out)
                                </Label>
                                <p id={`business-description`} className='text-muted-foreground text-xs'>
                                    IT Admin management without a business account
                                </p>
                            </div>
                        </div>}

                        {!tenantInfo?.id && <div className='border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-center gap-2 rounded-md border p-4 shadow-xs outline-none'>
                            <RadioGroupItem
                                value='admin'
                                id={`admin`}
                                aria-describedby={`admin-description`}
                                className='size-5 after:absolute after:inset-0 [&_svg]:size-3'
                            />
                            <div className='grid grow gap-2'>
                                <Label htmlFor={`admin`} className='justify-between'>
                                    Grid Admin Enrollment
                                </Label>
                                <p id={`admin-description`} className='text-muted-foreground text-xs'>
                                    Enroll this device using ID and Token
                                </p>
                            </div>
                        </div>}
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => {
                    setSelectedMode(deviceUse)
                    if (deviceUse == "admin") {
                        setStep(StepsEnum.adminEnrollment)
                    } else if (deviceUse == "personal") {
                        setGridConfig({
                            dontConnect: true
                        })
                        setStep(StepsEnum.account)
                    } else if (deviceUse == "business") {
                        setStep(StepsEnum.account)
                    } else {
                        setStep(StepsEnum.userCreate)
                    }
                }}><ArrowRightIcon /> Continue</Button>
            </CardFooter>
        </>
    )
}

export function AdminEnrollmentStep() {
    const { step, setStep, gridConfig, setGridConfig } = useContext(SetupContext)
    const [id, setId] = useState("")
    const [token, setToken] = useState("")
    const [url, setUrl] = useState("https://gridbackend.qplus.cloud")
    return (
        <>
            <CardHeader>
                <CardTitle>
                    Admin Enrollment
                </CardTitle>
                <CardDescription>
                    Enroll this device using ID and Token
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className="w-full h-full flex items-center justify-center gap-10">
                    <div className="flex flex-col gap-2 w-[382px]">
                        <Grid2X2Icon />
                        <div className="text-xl font-semibold">Enroll Device</div>
                        <div className="text-sm text-muted-foreground">Enter the ID and Token found in your Grid Admin Console</div>
                    </div>
                    <div className='w-[382px] flex flex-col'>
                        <div className="pb-2 text-md font-semibold">ID</div>
                        <Input placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
                        <div className="pb-2 text-md font-semibold pt-4">Token</div>
                        <Input placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
                        <Accordion type="single" collapsible>
                            <AccordionItem value="Advanced">
                                <AccordionTrigger>Advanced Options</AccordionTrigger>
                                <AccordionContent>
                                    <div className="text-md font-semibold pb-2">Grid URL</div>
                                    <Input placeholder="Grid URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => {
                    setGridConfig({
                        deviceId: id,
                        deviceToken: token,
                        serverUrl: url
                    })
                    setStep(StepsEnum.userCreate)
                }}><ArrowRightIcon /> Continue</Button>
            </CardFooter>
        </>
    )
}

export function AccountStep() {
    const { step, setStep, selectedMode, user, setUser } = useContext(SetupContext)
    const [stage, setStage] = useState("signin")
    const authFrame = useRef<HTMLIFrameElement>(null)
    const [canContinue, setCanContinue] = useState(false)
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
                {stage === "signin" && <iframe ref={authFrame} className="w-full h-full rounded-md" src="https://keystoneapi.qplus.cloud/auth/signin?redirectTo=https://theta-setup-redir.netlify.app&lts=true" />}
                {stage === "welcome" && <AccountWelcome setStage={setStage} setCanContinue={setCanContinue} setUser={setUser} user={user} />}
            </CardContent>
            {(stage === "welcome" && canContinue) && <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => {
                    setStep(StepsEnum.userCreate)
                }}><ArrowRightIcon /> Continue</Button>
            </CardFooter>}
        </>
    )
}

function AccountWelcome({ setStage, setCanContinue, setUser, user }: { setStage: (stage: string) => void, setCanContinue: (canContinue: boolean) => void, setUser: (user: any) => void, user: any }) {
    const { tenantInfo } = useContext(SetupContext)
    useEffect(() => {
        fetch("https://keystoneapi.qplus.cloud/auth/getsession", {
            credentials: "include",
            redirect: "manual"
        }).then((res) => res.json()).then((data) => {
            setUser(data)
            if (tenantInfo?.id && tenantInfo?.id != data.user?.tenant?.id) {
                setCanContinue(false)
            } else {
                setCanContinue(true)
            }
        })
    }, [tenantInfo])
    if (!user) {
        return <div>Loading...</div>
    }
    if (tenantInfo?.id && tenantInfo?.id != user.user?.tenant?.id) {
        return <div className="flex flex-col items-center justify-center h-full gap-2">
            <Avatar className="w-15 h-15">
                <AvatarFallback className="text-2xl">{user.user?.name.split("")[0].toUpperCase() + user.user?.name.split("")[1].toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">Welcome {user.user?.name}</h1>
            <p className="text-lg">{user.user?.email}</p>
            <p className="text-center">It looks like this account is not associated with the tenant "{tenantInfo?.name}"<br /> Please sign out and sign in with the correct account.</p>
            <Button onClick={() => {
                fetch("https://keystoneapi.qplus.cloud/auth/logout", {
                    credentials: "include",
                    redirect: "manual"
                }).then(() => {
                    setStage("signin")
                })
            }}><LogOutIcon /> Sign Out</Button>
        </div>
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

export function UserCreateStep() {
    const { step, setStep, user, selectedMode, gridConfig } = useContext(SetupContext)
    const [username, setUsername] = useState(user?.user?.username)
    const [userFullName, setUserFullName] = useState(user?.user?.name)
    const [password, setPassword] = useState("")
    const [url, setUrl] = useState("https://gridbackend.qplus.cloud")
    return (
        <>
            <CardHeader>
                <CardTitle>
                    Admin Enrollment
                </CardTitle>
                <CardDescription>
                    Enroll this device using an account
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className="w-full h-full flex items-center justify-center gap-10">
                    <div className="flex flex-col gap-2 w-[382px]">
                        <UserIcon />
                        <div className="text-xl font-semibold">Create Account</div>
                        <div className="text-sm text-muted-foreground">Create an account that will be used to login to this device</div>
                    </div>
                    <div className='w-[382px] flex flex-col'>
                        <div className="pb-2 text-md font-semibold">Full Name</div>
                        <Input placeholder="Full Name" value={userFullName} onChange={(e) => setUserFullName(e.target.value)} />
                        <div className="pb-2 text-md font-semibold pt-4">Username</div>
                        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <div className="pb-2 text-md font-semibold pt-4">Password</div>
                        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => {
                    window.childprocess.exec("sudo useradd -m -s /bin/bash -G sudo -c \"" + userFullName + "\" " + username)
                    window.childprocess.exec("sudo echo \"" + username + ":" + password + "\" | sudo chpasswd")
                    window.childprocess.exec("sudo echo \"" + username + " ALL=(ALL) NOPASSWD:ALL\" | sudo tee -a /etc/sudoers.d/" + username)
                    window.childprocess.exec("sudo passwd -l theta-initial-setup-user")
                    window.childprocess.exec("sudo rm /etc/gdm3/daemon.conf")
                    window.childprocess.exec("sudo touch /etc/gdm3/daemon.conf")
                    window.childprocess.exec("sudo bash -c 'echo \"[daemon]\" | sudo tee /etc/gdm3/daemon.conf'")
                    window.childprocess.exec("sudo bash -c 'echo \"AutomaticLoginEnable=False\" | sudo tee -a /etc/gdm3/daemon.conf'")
                    window.fs.writeFile(window.os.homeDir() + "/config.json", JSON.stringify(gridConfig))
                    window.childprocess.exec("sudo cp ~/config.json /home/" + username + "/config.json")
                    // if (selectedMode == "personal") {
                    //     window.childprocess.exec(`sudo bash -c 'echo "{\\"dontConnect\\": true}" > /home/${username}/config.json'`)
                    // }
                    setStep(StepsEnum.finished)
                }}><ArrowRightIcon /> Continue</Button>
            </CardFooter>
        </>
    )
}

export function FinishedStep() {
    return (
        <>
            <CardHeader>
                <CardTitle>
                    Finished
                </CardTitle>
                <CardDescription>
                    Your device has been successfully set up
                </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
                <div className="w-full h-full flex items-center justify-center gap-10">
                    <div className="flex flex-col gap-2 w-[382px]">
                        <CheckIcon />
                        <div className="text-xl font-semibold">Device Set Up Complete</div>
                        <div className="text-sm text-muted-foreground">Your device has been successfully set up</div>
                        <Button variant={"outline"} onClick={() => {
                            window.childprocess.exec("sudo rm /etc/markers/unsetup-marker")
                            window.childprocess.exec("sudo reboot -h now")
                        }}><ArrowRightIcon /> Continue</Button>
                    </div>
                </div>
            </CardContent>
        </>
    )
}