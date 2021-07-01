import React, { useEffect, useState } from 'react'
import './onlineStatus.scss'

export default function OnlineSatus () {
  const [online, isOnline] = useState(navigator.onLine)

  const setOnline = () => {
    console.log('We are online!')
    /**
     * fetch backend timestamp
     */
    isOnline(true)
  }
  const setOffline = () => {
    console.log('We are offline!')
    isOnline(false)
  }

  // Register the event listeners
  useEffect(() => {
    window.addEventListener('offline', setOffline)
    window.addEventListener('online', setOnline)

    // cleanup if we unmount
    return () => {
      window.removeEventListener('offline', setOffline)
      window.removeEventListener('online', setOnline)
    }
  }, [])

  return (
    <div className={`online-status-${online}`}>{online ? 'You are online' : 'You are offline'}</div>
  )
}
