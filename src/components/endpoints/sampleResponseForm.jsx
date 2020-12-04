import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'

class SampleResponseForm extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: { status: '', description: '', body: '', title: '' },
      errors: {}
    }

    this.schema = {
      title: Joi.string().required().max(5).label('Title: '),
      status: Joi.number().min(100).max(599).label('Status: '),
      description: Joi.string().allow(null, '').label('Description: '),
      body: Joi.object().allow(null, '', 'null').label('Body: ')
    }
  }

  async componentDidMount () {
    let data = {}
    if (this.props.selectedSampleResponse) {
      let {
        title,
        status,
        description,
        data: body
      } = this.props.selectedSampleResponse
      body = JSON.stringify(body, null, 2)
      data = {
        title,
        status,
        description,
        body
      }
    }
    this.setState({ data })
  }

  editSampleResponse () {
    let { status, description, body: data, title } = this.state.data
    try {
      data = JSON.parse(data)
    } catch (error) {
      data = null
    }
    const index = this.props.index
    const sampleResponse = { status, description, data, title }
    const sampleResponseArray = [...this.props.sample_response_array]
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array]
    sampleResponseArray[index] = sampleResponse
    this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
  }

  addSampleResponse () {
    let { title, status, description, body: data } = this.state.data
    try {
      data = JSON.parse(data)
    } catch (error) {
      data = null
    }

    const sampleResponse = { title, status, description, data }
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
    if (this.checkDuplicateName()) {
      this.props.onHide()
      if (this.props.title === 'Add Sample Response') {
        this.addSampleResponse()
      }
      if (this.props.title === 'Edit Sample Response') {
        this.editSampleResponse()
      }
    }
  }

  checkDuplicateName () {
    if (this.props && this.props.endpoints) {
      const usedTitles = []
      const endpointId = this.props.location.pathname.split('/')[3]
      const endpoint = this.props.endpoints[endpointId] || []
      const sampleResponse = endpoint.sampleResponse || []
      sampleResponse.map(key => { return usedTitles.push(key.title) })

      if (usedTitles.includes(this.state.data.title)) {
        this.setState({ errors: { ...this.state.errors, title: 'Title must be unique' } })
        return false
      } else return true
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
            {this.renderInput('title', 'Title: ', 'Enter Title ')}
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
