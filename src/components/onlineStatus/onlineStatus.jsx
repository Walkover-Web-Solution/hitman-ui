import React, { useEffect, useState } from 'react'

export default function OnlineSatus () {
  const [online, isOnline] = useState(navigator.onLine)

  const setOnline = () => {
    console.log('We are online!')
    // check for data update require
    // try {

    // }
    // catch (err) {

    // }
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
    <div>{online}</div>
  )
}
