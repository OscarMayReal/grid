import './App.css'
import { Button } from './components/ui/button'
import { Grid2X2Icon } from 'lucide-react'

function App() {
  return (
    <>
      <div className='w-full h-full' />
      <Bar />
    </>
  )
}

function Bar() {
  return (
    <div className='bar'>
      <Button size={"sm"} variant={"outline"}><Grid2X2Icon />Enterprise Enrollment</Button>
    </div>
  )
}

export default App
