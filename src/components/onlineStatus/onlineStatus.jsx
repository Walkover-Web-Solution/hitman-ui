import React, { useEffect, useState } from 'react'
import './onlineStatus.scss'

export default function OnlineSatus (props) {
  const [online, isOnline] = useState(navigator.onLine)
  const [needToUpdate, changeStatus] = useState(false)
  const [timestamp, setTime] = useState(null)

  const setOnline = async () => {
    console.log('We are online!')
    /**
     * fetch backend timestamp
     */
    const { fetchFromIdb, timestampBackend } = await props.isIdbUpdated()
    if (!fetchFromIdb) {
      changeStatus(true)
      setTime(timestampBackend)
    }
    isOnline(true)
  }
  const setOffline = () => {
    console.log('We are offline!')
    isOnline(false)
  }

  const fetchDataFromBackend = () => {
    props.fetchFromBackend(timestamp)
    changeStatus(false)
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
    <div>
      <div className={`online-status-${online}`}>{online ? 'You are online' : 'You are offline'}</div>
      {needToUpdate && <button onClick={() => fetchDataFromBackend()}>refresh</button>}
    </div>
  )
}
