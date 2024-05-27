import React from "react"
import { Modal } from "react-bootstrap"
import Joi from "joi-browser"
import Form from "../common/form"

class SampleResponseForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: { status: "", description: "", body: "", title: "" },
      errors: {}
    }

    this.schema = {
      title: Joi.string().required().max(5).label("Title: "),
      status: Joi.number().min(100).max(599).label("Status: "),
      description: Joi.string().allow(null, "").label("Description: "),
      body: Joi.string().max(2000).allow(null, "", "null").label("Body: ")
    }
  }

  async componentDidMount() {
    let data = {}
    if (this.props.selectedSampleResponse) {
      let { title, status, description, data: body } = this.props.selectedSampleResponse
      body = JSON.stringify(body, null, 2)
      data = {
        title,
        status: status ? String(status) : "",
        description,
        body
      }
    }
    this.setState({ data })
  }

  editSampleResponse() {
    let { status, description, body: data, title } = this.state.data
    try {
      data = JSON.parse(data)
    } catch (error) {
      data = null
    }
    const index = this.props.index
    const sampleResponse = { status, description, data, title }
    const sampleResponseArray = [...this.props.endpointContent.sampleResponseArray]
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array]
    sampleResponseArray[index] = sampleResponse
    this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
  }

  addSampleResponse() {
    let { title, status, description, body: data } = this.state.data
    try {
      data = JSON.parse(data)
    } catch (error) {
      data = null
    }

    const sampleResponse = { title, status, description, data }
    const sampleResponseArray = [...this.props.endpointContent.sampleResponseArray, sampleResponse]
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array, false]
    this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
  }

  async doSubmit() {
    if (this.checkDuplicateName()) {
      this.props.onHide()
      if (this.props.title === "Add Sample Response") {
        this.addSampleResponse()
      }
      if (this.props.title === "Edit Sample Response") {
        this.editSampleResponse()
      }
    }
  }

  checkDuplicateName() {
    if (this.props && this.props.endpoints) {
      const usedTitles = []
      // const endpointId = this.props.location.pathname.split('/')[5]
      // const endpoint = this.props.endpoints[endpointId] || []
      const sampleResponse = this.props.endpointContent.sampleResponseArray || []
      sampleResponse.map((key) => {
        return usedTitles.push(key.title)
      })

      if (this.props.title === "Edit Sample Response") {
        usedTitles.splice(usedTitles.indexOf(sampleResponse[this.props.index].title), 1)
      }

      if (usedTitles.includes(this.state.data.title)) {
        this.setState({ errors: { ...this.state.errors, title: "Title must be unique" } })
        return false
      } else return true
    }
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide} size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered className='custom-collection'>
        <Modal.Header className='custom-collection-modal-container p-3' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-3'>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("title", "Title: ", "Enter Title ", false, false, false)}
            {this.renderInput("status", "Status: ", "Enter Status ", false, false, false)}
            {this.renderInput("description", "Description: ", "Enter Descripton")}
            {this.renderAceEditor("body", "Body: ")}
            <div className='text-right mt-2 mb-2'>
              <button className='btn btn-secondary outline btn-sm fs-4 mr-2' onClick={this.props.onHide}>
                Cancel
              </button>
              {this.renderButton("Submit")}
            </div>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default SampleResponseForm
