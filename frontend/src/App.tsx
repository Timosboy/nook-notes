import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { authApi } from './auth/api'
import { AuthScreen } from './auth/AuthScreen'
import { sessionExpired, updateUser, useSession } from './lib/session'
import { Workspace } from './workspace/Workspace'

export default function App() {
  const session = useSession()
  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    authApi.me().then(updateUser).catch(() => undefined)
  }, [userId])

  return (
    <MotionConfig reducedMotion="user">
      {session ? <Workspace key={session.user.id} /> : <AuthScreen expired={sessionExpired()} />}
    </MotionConfig>
  )
}
