'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import LoadingScreen from './LoadingScreen'

export default function LoadingOverlay({ show }: { show: boolean }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!show || !mounted) return null

  return createPortal(<LoadingScreen />, document.body)
}
