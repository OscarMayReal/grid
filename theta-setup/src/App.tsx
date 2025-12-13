import { createContext, useContext, useEffect, useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { ArrowRightIcon, BatteryChargingIcon, BatteryIcon, Grid2X2Icon, NetworkIcon, PowerIcon, QrCodeIcon, XIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import type { WiFiNetwork } from "node-wifi"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Scanner } from '@yudiel/react-qr-scanner'
import { ButtonGroup } from './components/ui/button-group'
import { InitStep, NetworkStep, AccountStep, DeviceUseStep, AdminEnrollmentStep, EnrollInfoStep, FinishedStep, UserCreateStep } from './steps'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu'

export enum StepsEnum {
  init,
  network,
  deviceUse,
  account,
  enrollInfo,
  adminEnrollment,
  finished,
  userCreate
}

export const SetupContext = createContext({
  step: StepsEnum.init,
  setStep: (step: StepsEnum) => { },
  tenantInfo: {},
  setTenantInfo: (tenantInfo: any) => { },
  gridConfig: {},
  setGridConfig: (gridConfig: any) => { },
  selectedMode: "",
  setSelectedMode: (selectedMode: string) => { },
  user: {},
  setUser: (user: any) => { }
})

function App() {
  const [step, setStep] = useState(StepsEnum.init)
  const [tenantInfo, setTenantInfo] = useState({})
  const [gridConfig, setGridConfig] = useState({})
  const [selectedMode, setSelectedMode] = useState("")
  const [user, setUser] = useState({})
  return (
    <SetupContext.Provider value={{ step, setStep, tenantInfo, setTenantInfo, gridConfig, setGridConfig, selectedMode, setSelectedMode, user, setUser }}>
      <>
        <div className='w-full h-full flex flex-col items-center justify-center'>
          <Card className='mainwindow'>
            {step === StepsEnum.init && <InitStep />}
            {step === StepsEnum.deviceUse && <DeviceUseStep />}
            {step === StepsEnum.network && <NetworkStep />}
            {step === StepsEnum.account && <AccountStep />}
            {step === StepsEnum.adminEnrollment && <AdminEnrollmentStep />}
            {step === StepsEnum.enrollInfo && <EnrollInfoStep />}
            {step === StepsEnum.finished && <FinishedStep />}
            {step === StepsEnum.userCreate && <UserCreateStep />}
          </Card>
        </div>
        <Bar />
      </>
    </SetupContext.Provider>
  )
}

function Bar() {
  const [battery, setBattery] = useState({ level: 0, charging: false })
  const [qrEnrollOpen, setQrEnrollOpen] = useState(false)
  const { step } = useContext(SetupContext)
  useEffect(() => {
    navigator.getBattery().then((battery) => {
      setBattery(battery)
      battery.addEventListener('levelchange', () => {
        navigator.getBattery().then((battery) => {
          setBattery(battery)
        })
      })
      battery.addEventListener('chargingchange', () => {
        navigator.getBattery().then((battery) => {
          setBattery(battery)
        })
      })
      return () => {
        battery.removeEventListener('levelchange', () => {
          navigator.getBattery().then((battery) => {
            setBattery(battery)
          })
        })
        battery.removeEventListener('chargingchange', () => {
          navigator.getBattery().then((battery) => {
            setBattery(battery)
          })
        })
      }
    })
  }, [])
  return (
    <div className='bar'>
      {step === StepsEnum.init && <Button onClick={() => setQrEnrollOpen(true)} size={"sm"} variant={"outline"}><QrCodeIcon />Enroll With QR Code</Button>}
      <QREnrollDialog open={qrEnrollOpen} setOpen={setQrEnrollOpen} />
      <div className='flex-1' />
      <ButtonGroup>
        <Button size={"sm"} variant={"outline"}>{window.navigator.onLine ? <NetworkIcon /> : <XIcon />}</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"outline"}>{battery.charging ? <BatteryChargingIcon /> : <BatteryIcon />}{battery.level * 100}%</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem ><BatteryIcon /> {battery.level * 100}%</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}

function QREnrollDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Enroll With QR Code</DialogTitle>
        <DialogDescription>Enroll this device using a QR Code generated with Grid. this device will enter management and be ready for a user to sign in</DialogDescription>
      </DialogHeader>
      <Scanner classNames={{
        container: "rounded-md"
      }} />
    </DialogContent>
  </Dialog>
}

export default App
