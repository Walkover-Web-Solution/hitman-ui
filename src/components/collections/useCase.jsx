import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'

class UseCase extends Component {
  constructor (props) {
    super(props)
    this.setHiddens()
  }

  setHiddens () {
    window.superformHiddens = {
      name: 'abc',
      email: 'abc@cd.com',
      organisation: 'cd',
      hidden: 'null'
    }
    window.superformIds = ['UnBc']
  }

  render () {
    return (
      <Modal
        size='lg'
        animation={false}
        aria-labelledby=''
        centered
        onHide={this.props.onHide}
        show={this.props.show}
      >
        <div id='UnBc' />
      </Modal>
    )
  }
}

export default UseCase
