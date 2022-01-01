import React from 'react'
import { Modal } from 'react-bootstrap'
import { openExternalLink } from '../common/utility'
import { closeModal } from '../modals/redux/modalsActions'
import { connect } from 'react-redux'
import { DESKTOP_APP_DOWNLOAD } from '../modals/modalTypes'
import { sendAmplitudeData } from '../../services/amplitude'

const DESKTOP_APP_DOWNLOAD_LINK = process.env.REACT_APP_DESKTOP_APP_DOWNLOAD_LINK

const mapDispatchToProps = (dispatch) => {
  return {
    close_modal: () => dispatch(closeModal())
  }
}

const mapStateToProps = (state) => {
  return {
    modals: state.modals,
    tabs: state.tabs
  }
}

function DesktopAppDownloadModal (props) {
  const handleDownloadClick = () => {
    sendAmplitudeData('Download popup')
    const link = `${DESKTOP_APP_DOWNLOAD_LINK}?source=popup`
    openExternalLink(link)
  }

  const show = props.modals.activeModal === DESKTOP_APP_DOWNLOAD

  const onHide = () => {
    const { orgId } = props.match.params
    props.history.replace({
      pathname: `/orgs/${orgId}/dashboard/`
    })
    props.close_modal()
  }
  return (
    show &&
      <Modal {...props} backdrop='static' show centered onHide={onHide}>
        <Modal.Header className='no-header' closeButton />
        <Modal.Body className='download-app-pop'>
          {props.modals.modalData
            ? props.modals.modalData
            : <h5 className='text-center'>Seems you have already used 5 tabs.</h5>}
          <p className='text-center'>We suggest you use our desktop app for a better user experience. Also, enjoy other benefits</p>
          <ol>
            <li>The desktop agent overcomes the Cross Object Resource Sharing (CORS) limitations of browsers</li>
            <li>Better shortcuts</li>
            <li>Dark mode</li>
            <li>Extendend capabilites</li>
          </ol>
        </Modal.Body>
        <Modal.Footer className='text-center justify-content-center'>
          <button onClick={handleDownloadClick} className='btn btn-primary'>Download Desktop App</button>
        </Modal.Footer>
      </Modal>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DesktopAppDownloadModal)
