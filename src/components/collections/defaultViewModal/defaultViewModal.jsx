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
        {this.props.viewLoader.testing ? this.renderSpinner() : 'API Testing'}
      </button>
    )
  }

  renderDocButton () {
    return (
      <button className='block-view-btn' onClick={() => this.createCollection(defaultViewTypes.DOC)}>
        <img src={DocIcon} alt='' />
        {this.props.viewLoader.doc ? this.renderSpinner() : 'Host API Doc'}
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
    return (
      <>
        <div className='d-flex justify-content-center'>
          {this.renderTestingButton()}
          {this.renderDocButton()}
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
      <div>
        <h6 className='text-center mb-4'>Choose what you'll do with your collection</h6>
        {this.renderButtons()}
      </div>
    )
  }
}

export default DefaultViewModal
