import { Button } from "./components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "./components/ui/card";
import { SetupContext, StepsEnum } from "./App";
import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Input } from "./components/ui/input";

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

            </CardContent>
            <CardFooter>
                <div className='flex-1' />
                <Button onClick={() => setStep(StepsEnum.network)}><ArrowRightIcon /> Get Started</Button>
            </CardFooter>
        </>
    )
}

export function NetworkStep() {
    const { step, setStep } = useContext(SetupContext)
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
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold">Welcome {user.user.name}</h1>
            <p className="text-lg">{user.user.email}</p>
            <p>{user.user?.tenant?.id ? "Managed Quntem Account (" + user.user.tenant.name + ")" : "Personal Quntem Account"}</p>
        </div>
    )
}