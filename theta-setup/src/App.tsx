import { useEffect, useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { ArrowRightIcon, BatteryIcon, Grid2X2Icon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import type { WiFiNetwork } from "node-wifi"

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
      <Button size={"sm"} variant={"outline"}><Grid2X2Icon />Enterprise Enrollment</Button>
      <div className='flex-1' />
      <Button size={"sm"} variant={"outline"}><BatteryIcon />{batteryPercent * 100}%</Button>
    </div>
  )
}

export default App
