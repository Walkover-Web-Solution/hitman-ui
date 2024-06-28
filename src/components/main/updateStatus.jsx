import React, { useState, useEffect } from 'react'
import './updateStatus.scss'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { Spinner } from 'react-bootstrap'
import { isElectron, formatBytes } from '../common/utility'

const type = {
  UPDATE_AVAILABLE: 'UPDATE_AVAILABLE',
  DOWNLOAD_PROGRESS: 'DOWNLOAD_PROGRESS',
  UPDATE_DOWNLOADED: 'UPDATE_DOWNLOADED',
  ERROR: 'ERROR',
  CHECKING_FOR_UPDATES: 'CHECKING_FOR_UPDATES',
  UPDATE_NOT_AVAILABLE: 'UPDATE_NOT_AVAILABLE'
}

const UpdateStatus = () => {
  const [data, setData] = useState(null)
  const [message, setMessage] = useState('')
  const [updateStatusDisplay, setUpdateStatusDisplay] = useState(false)
  const [progressBar, setProgressBar] = useState(false)
  const [closeButton, setCloseButton] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron')
      const handleAutoUpdateEvents = (event, text) => {
        let updatedMessage = ''
        switch (text.type) {
          case type.UPDATE_AVAILABLE:
            updatedMessage = 'Update Available'
            setMessage(updatedMessage)
            setUpdateStatusDisplay(true)
            setShowSpinner(false)
            break
          case type.DOWNLOAD_PROGRESS:
            updatedMessage = 'An Update is downloading'
            setMessage(updatedMessage)
            setProgressBar(true)
            setData(text.data)
            setUpdateStatusDisplay(true)
            setShowSpinner(false)
            break
          case type.UPDATE_DOWNLOADED:
            updatedMessage = 'Update downloaded. Restart app to install.'
            setMessage(updatedMessage)
            setCloseButton(true)
            setUpdateStatusDisplay(true)
            setProgressBar(false)
            setShowSpinner(false)
            break
          case type.ERROR:
            updatedMessage = 'Something went wrong while trying to update'
            setMessage(updatedMessage)
            setShowSpinner(false)
            setUpdateStatusDisplay(true)
            setCloseButton(true)
            break
          case type.CHECKING_FOR_UPDATES:
            updatedMessage = 'Checking For Updates'
            setMessage(updatedMessage)
            setUpdateStatusDisplay(true)
            setShowSpinner(true)
            break
          case type.UPDATE_NOT_AVAILABLE:
            updatedMessage = 'Already Up to Date'
            setMessage(updatedMessage)
            setUpdateStatusDisplay(false)
            setShowSpinner(false)
            break
          default:
            break
        }
      }

      ipcRenderer.on('app-update-channel', handleAutoUpdateEvents)

      // Cleanup function
      return () => {
        ipcRenderer.off('app-update-channel', handleAutoUpdateEvents)
      }
    }
  }, [])

  const handleClose = () => {
    setUpdateStatusDisplay(false)
    setProgressBar(false)
    setCloseButton(false)
  }

  const renderProgressDetails = () => {
    if (data) {
      return <small>{`${formatBytes(data.transferred)}/${formatBytes(data.total)} @ ${formatBytes(data.bytesPerSecond)}/s`}</small>
    }
    return null
  }

  return (
    <div>
      {updateStatusDisplay && (
        <div className='update-status-component px-3 py-2'>
          <div className='d-flex align-items-center'>
            {showSpinner && <Spinner className='mr-2' animation='border' size='sm' />}
            <span className='m-0'>
              <strong>{message}</strong>
            </span>
          </div>

          {progressBar && (
            <>
              <ProgressBar variant='warning' now={Math.floor(data.percent)} />
              {renderProgressDetails()}
            </>
          )}

          {closeButton && (
            <button type='button' className='close' onClick={handleClose}>
              <span aria-hidden='true'>×</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default UpdateStatus
