import type { Transition } from 'motion/react'

export const ease: Transition['ease'] = [0.22, 1, 0.36, 1]

export const spring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 40,
}
