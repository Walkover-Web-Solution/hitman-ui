import React, { Component } from 'react'
import './updateStatus.scss'
import ProgressBar from 'react-bootstrap/ProgressBar'

const type = {
  UPDATE_AVAILABLE: 'UPDATE_AVAILABLE',
  DOWNLOAD_PROGRESS: 'DOWNLOAD_PROGRESS',
  UPDATE_DOWNLOADED: 'UPDATE_DOWNLOADED',
  ERROR: 'ERROR',
  CHECKING_FOR_UPDATES: 'CHECKING_FOR_UPDATES',
  UPDATE_NOT_AVAILABLE: 'UPDATE_NOT_AVAILABLE'
}

class UpdateStatus extends Component {
    state = {
      data: null,
      message: 'Hey, I am working',
      updateStatusDisplay: true,
      progressBar: true,
      closeButton: true
    }

    componentDidMount () {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer.on('app-update-channel', function (event, text) {
        let message = ''
        switch (text.type) {
          case type.UPDATE_AVAILABLE :
            message = 'Update Available'
            this.setState({ message, updateStatusDisplay: true })
            break
          case type.DOWNLOAD_PROGRESS :
            message = 'Download Progress'
            this.setState({ message, progressBar: true, data: text.data, updateStatusDisplay: true })
            break
          case type.UPDATE_DOWNLOADED :
            message = 'Update downloaded...Resatart the app'
            this.setState({ message, closeButton: true, updateStatusDisplay: true, progressBar: false })
            break
          case type.ERROR:
            message = 'Somthing went wrong :('
            this.setState({ message, updateStatusDisplay: true })
            break
          case type.CHECKING_FOR_UPDATES:
            break
          case type.UPDATE_NOT_AVAILABLE:
            break
          default:
            break
        }
      })
    }

     handleClose=() => {
       this.setState({ updateStatusDisplay: false, progressBar: false, closeButton: false })
     }

     render () {
       const { updateStatusDisplay, progressBar, /* data, */ message, closeButton } = this.state
       // let percentage= Math.floor(data.percent);
       return (
         <div>
           {updateStatusDisplay &&
             <div className='update-status-component'>
               <h4>{message}</h4>
               {progressBar && <ProgressBar variant='warning' now={90} />}
               {closeButton && <button type='button' className='btn-close' onClick={this.handleClose}>Close</button>}
             </div>}
         </div>
       )
     }
}

export default UpdateStatus
