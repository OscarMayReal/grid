import { useEffect, useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { ArrowRightIcon, BatteryIcon, Grid2X2Icon, QrCodeIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import type { WiFiNetwork } from "node-wifi"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Scanner } from '@yudiel/react-qr-scanner'

function App() {
  return (
    <>
      <div className='w-full h-full flex flex-col items-center justify-center'>
        <Card className='mainwindow'>
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
            <Button><ArrowRightIcon/> Get Started</Button>
          </CardFooter>
        </Card>
      </div>
      <Bar />
    </>
  )
}

function Bar() {
  const [batteryPercent, setBatteryPercent] = useState(0)
  const [networks, setNetworks] = useState<WiFiNetwork[]>([])
  const [qrEnrollOpen, setQrEnrollOpen] = useState(false)
  useEffect(() => {
    window.wifi.scan().then((networks) => {
      setNetworks(networks)
      console.log(networks)
    })
  }, [])
  useEffect(() => {
    navigator.getBattery().then((battery) => {
      setBatteryPercent(battery.level)
      battery.addEventListener('levelchange', () => {
        setBatteryPercent(battery.level)
      })
    })
  }, [])
  return (
    <div className='bar'>
      <Button onClick={() => setQrEnrollOpen(true)} size={"sm"} variant={"outline"}><QrCodeIcon />Enroll With QR Code</Button>
      <QREnrollDialog open={qrEnrollOpen} setOpen={setQrEnrollOpen} />
      <div className='flex-1' />
      <Button size={"sm"} variant={"outline"}><BatteryIcon />{batteryPercent * 100}%</Button>
    </div>
  )
}

function QREnrollDialog({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
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
