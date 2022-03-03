import React, { Component } from 'react'

export class DefaultViewModal extends Component {
  createCollection (defaultView) {
    console.log('hello', defaultView)
    // this.props.saveCollection()
  }

  renderTestingButton () {
    return (
      <button onClick={() => this.createCollection('testing')}>
        API Testing
      </button>
    )
  }

  renderDocButton () {
    return (
      <button onClick={() => this.createCollection('doc')}>
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
