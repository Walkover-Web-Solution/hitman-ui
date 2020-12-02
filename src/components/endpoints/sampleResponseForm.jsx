import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'

class SampleResponseForm extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: { status: '', description: '', body: '' },
      errors: {}
    }

    this.schema = {
      status: Joi.number().min(100).max(599).label('status: '),
      description: Joi.string().allow(null, '').label('description: '),
      body: Joi.object().allow(null, '', 'null').label('body: ')
    }
  }

  async componentDidMount () {
    let data = {}
    if (this.props.title === 'Add Sample Response') return
    if (
      this.props.title === 'Edit Sample Response' &&
      this.props.selectedSampleResponse
    ) {
      let {
        status,
        description,
        data: body
      } = this.props.selectedSampleResponse
      body = JSON.stringify(body, null, 2)
      data = {
        status,
        description,
        body
      }
    }
    this.setState({ data })
  }

  editSampleResponse () {
    let { status, description, body: data } = this.state.data
    try {
      data = JSON.parse(data)
    } catch (error) {
      data = null
    }
    const index = this.props.index
    const sampleResponse = { status, description, data }
    const sampleResponseArray = [...this.props.sample_response_array]
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array]
    sampleResponseArray[index] = sampleResponse
    this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
  }

  addSampleResponse () {
    let { status, description, body: data } = this.state.data
    try {
      data = JSON.parse(data)
    } catch (error) {
      data = null
    }

    const sampleResponse = { status, description, data }
    const sampleResponseArray = [
      ...this.props.sample_response_array,
      sampleResponse
    ]
    const sampleResponseFlagArray = [
      ...this.props.sample_response_flag_array,
      false
    ]
    this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
  }

  async doSubmit () {
    this.props.onHide()
    if (this.props.title === 'Add Sample Response') {
      this.addSampleResponse()
    }
    if (this.props.title === 'Edit Sample Response') {
      this.editSampleResponse()
    }
  }

  render () {
    return (
      <Modal
        {...this.props}
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput('status', 'Status: ', 'Enter Status ')}
            {this.renderInput(
              'description',
              'Description: ',
              'Enter Descripton'
            )}
            {this.renderAceEditor('body', 'Body: ')}
            <div className='text-right mt-2 mb-2'>
              {this.renderButton('Submit')}
              <button
                className='btn btn-secondary btn-lg ml-2'
                onClick={this.props.onHide}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default SampleResponseForm
