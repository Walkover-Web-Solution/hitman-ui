import React, { Component } from 'react'

export class DefaultViewModal extends Component {
  renderTestingButton () {
    return (
      <button onClick={() => console.log('hello api')}>
        API Testing
      </button>
    )
  }

  renderDocButton () {
    return (
      <button onClick={() => console.log('hello doc')}>
        Host API Doc
      </button>
    )
  }

  renderButtons () {
    return (
      <div className='d-flex align-items-center'>
        {this.renderTestingButton()}
        {this.renderDocButton()}
      </div>
    )
  }

  render () {
    return (
      <div>{this.renderButtons()}</div>
    )
  }
}

export default DefaultViewModal
