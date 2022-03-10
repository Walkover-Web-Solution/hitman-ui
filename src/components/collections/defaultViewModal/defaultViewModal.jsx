import React, { Component } from 'react'
import DocIcon from '../../../assets/icons/doc.svg'
import ApiIcon from '../../../assets/icons/api.svg'
import InfoIcon from '../../../assets/icons/info.svg'
import './defaultViewModal.scss'
import { Spinner } from 'react-bootstrap'
export const defaultViewTypes = {
  TESTING: 'testing',
  DOC: 'doc'
}
export class DefaultViewModal extends Component {
  createCollection (defaultView) {
    this.props.saveCollection(defaultView, true)
  }

  renderTestingButton () {
    return (
      <button className='block-view-btn mr-3' onClick={() => this.createCollection(defaultViewTypes.TESTING)}>
        <img src={ApiIcon} alt='' />
        API Testing
      </button>
    )
  }

  renderDocButton () {
    return (
      <button className='block-view-btn' onClick={() => this.createCollection(defaultViewTypes.DOC)}>
        <img src={DocIcon} alt='' />
        Host API Doc
      </button>
    )
  }

  renderSpinner () {
    return (
      <div className='d-flex justify-content-center align-items-center'>
        <Spinner as='div' animation='border' size='md' role='status' />
      </div>
    )
  }

  renderButtons () {
    const { viewLoader } = this.props
    return (
      <>
        <div className='d-flex justify-content-center'>
          {viewLoader.testing ? this.renderSpinner() : this.renderTestingButton()}
          {viewLoader.doc ? this.renderSpinner() : this.renderDocButton()}
        </div>
        <div className='info mt-5 d-flex align-items-center'>
          <img src={InfoIcon} className='mr-2' alt='' />
          <span>You can always choose to Test the API's or make the Testing collection public at any point</span>
        </div>
      </>
    )
  }

  render () {
    return (
      <div>{this.renderButtons()}</div>
    )
  }
}

export default DefaultViewModal
