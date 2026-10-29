import { MotionConfig } from 'motion/react'
import { Workspace } from './workspace/Workspace'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Workspace />
    </MotionConfig>
  )
}
